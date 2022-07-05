import { FirebaseError } from 'firebase/app';
import { signInWithCustomToken } from 'firebase/auth';
import { fold } from 'fp-ts/lib/Either';
import { identity, pipe } from 'fp-ts/lib/function';
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { login } from '../../apis/auth-service';
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

    const token = pipe(
      await login(signInEmail, password),
      fold((error) => {
        switch (error.type) {
          case 'invalid-credentials':
            setErrorMessage('이메일 혹은 비밀번호가 잘못됐습니다.');
            break;
          case 'unexpected':
            setErrorMessage(
              `알 수 없는 오류가 발생했습니다. 계속되면 heektime@heek.kr 로 문의 부탁드립니다.`
            );
            break;
        }
        return null;
      }, identity)
    );
    if (token == null) {
      setLoading(false);
      return;
    }

    try {
      await signInWithCustomToken(auth, token);
    } catch (err) {
      if (!(err instanceof FirebaseError)) {
        throw err;
      }
      // TODO: Unexpected
      setErrorMessage(
        `로그인 시도 중 알 수 없는 오류가 발생했습니다. ${err.code}`
      );
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
            <input
              type="email"
              placeholder="example@example.com"
              value={email}
              onChange={handleChangeEmail}
            />
          </label>
          <label>
            <span className={styles.label}>비밀번호</span>
            <input
              type="password"
              placeholder="********"
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
