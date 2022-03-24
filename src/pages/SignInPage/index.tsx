import { FirebaseError } from 'firebase/app';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Loading } from '../../components';
import Layout from '../../components/Layout';
import { auth } from '../../firebase';
import styles from './index.module.scss';

const LEGACY_USER_EMAIL_DOMAIN = 'user.heektime.heek.kr';

const SignInPage = (): React.ReactElement => {
  const [isLoading, setLoading] = useState(false);
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
    if (email === '') {
      setErrorMessage('이메일을 입력하세요.');
      return;
    }
    if (password === '') {
      setErrorMessage('비밀번호를 입력하세요.');
      return;
    }

    setLoading(true);
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
      setLoading(false);
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
      <div className={styles.container}>
        <h2>로그인</h2>

        <div className={styles.form}>
          <label>
            <span className={styles.label}>이메일 (또는 구.ID)</span>
            <input type="email" value={email} onChange={handleChangeEmail} />
          </label>
          <label>
            <span className={styles.label}>비밀번호</span>
            <input
              type="password"
              value={password}
              onChange={handleChangePassword}
              onKeyDown={handleKeyDown}
            />
          </label>
          <button
            className={styles.primary}
            disabled={isLoading}
            onClick={handleClickSubmit}
          >
            {isLoading ? <Loading inline /> : '로그인'}
          </button>
          {errorMessage != null && (
            <div className={styles.errorContainer}>
              <p>{errorMessage}</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SignInPage;
