import { FirebaseError } from 'firebase/app';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import Layout from '../components/Layout';
import { auth } from '../firebase';

const LEGACY_USER_EMAIL_DOMAIN = 'user.heektime.heek.kr';

const SignInPage = (): React.ReactElement => {
  const [errorMessage, setErrorMessage] = useState<string>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const handleChangeEmail = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value);
  };
  const handleChangePassword = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setPassword(e.target.value);
  };
  const handleClickSubmit = async (): Promise<void> => {
    const signInEmail = email.includes('@')
      ? email
      : `${email}@${LEGACY_USER_EMAIL_DOMAIN}`;

    try {
      await signInWithEmailAndPassword(auth, signInEmail, password);
    } catch (err) {
      if (!(err instanceof FirebaseError)) {
        throw err;
      }
      switch (err.code) {
        case 'auth/user-not-found':
          setErrorMessage('사용자를 찾을 수 없습니다.');
          break;
        case 'auth/wrong-password':
          setErrorMessage('잘못된 비밀번호입니다.');
          break;
        default:
          setErrorMessage(
            `로그인 시도 중 알 수 없는 오류가 발생했습니다. ${err.code}`
          );
      }
      return;
    }
    navigate(searchParams.get('redirect') || '/');
  };

  const handleKeyDown = async (e: React.KeyboardEvent): Promise<void> => {
    if (e.key === 'Enter') {
      await handleClickSubmit();
    }
  };

  return (
    <Layout>
      {errorMessage != null && <p>{errorMessage}</p>}
      <input type="email" value={email} onChange={handleChangeEmail} />
      <input
        type="password"
        value={password}
        onChange={handleChangePassword}
        onKeyDown={handleKeyDown}
      />
      <button onClick={handleClickSubmit}>Sign-In</button>
    </Layout>
  );
};

export default SignInPage;
