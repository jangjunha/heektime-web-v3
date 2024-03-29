import classNames from 'classnames';
import { FirebaseError } from 'firebase/app';
import { signInWithCustomToken } from 'firebase/auth';
import { fold } from 'fp-ts/lib/Either';
import { identity, pipe } from 'fp-ts/lib/function';
import React, { useContext, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import * as yup from 'yup';

import { login, register } from '../../../apis/auth-service';
import { Loading } from '../../../components';
import { _FirebaseAuthContext } from '../../../contexts/login';
import { auth } from '../../../firebase';
import styles from './common.module.scss';

const schema = yup.object().shape({
  email: yup
    .string()
    .email('올바른 메일주소가 아닙니다.')
    .required('이메일을 입력하세요.'),
  password: yup
    .string()
    .required('비밀번호를 입력하세요.')
    .min(6, '비밀번호는 6자 이상이어야 합니다.'),
});

const Error = ({
  children,
}: {
  children?: React.ReactNode;
}): React.ReactElement => (
  <div className={styles.errorContainer}>
    <p>{children}</p>
  </div>
);

const RegisterPage = (): React.ReactElement => {
  const authUser = useContext(_FirebaseAuthContext);

  const [isLoading, setLoading] = useState(false);
  const [isValidationEnabled, enableValidation] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  if (authUser !== null) {
    return (
      <Navigate
        to={{
          pathname: '../create-user-info/',
          search: searchParams.toString(),
        }}
        replace
      />
    );
  }

  const validate = (): yup.ValidationError | undefined => {
    try {
      schema.validateSync({ email, password });
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        return err;
      } else {
        throw err;
      }
    }
  };
  const error = validate();
  const displayingError = isValidationEnabled ? error : undefined;
  const disabled =
    displayingError !== undefined && errorMessage === undefined && !isLoading;

  const handleChangeEmail = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value);
  };
  const handleChangePassword = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setPassword(e.target.value);
  };
  const handleClickSubmit = async (): Promise<void> => {
    if (error != null || disabled) {
      enableValidation(true);
      return;
    }

    setLoading(true);
    const registerSucceed = pipe(
      await register(email, password),
      fold(
        (error) => {
          switch (error.type) {
            case 'email-already-exists':
              setErrorMessage('이미 사용중인 이메일입니다.');
              break;
            case 'invalid':
            case 'unexpected':
              setErrorMessage(
                `알 수 없는 오류가 발생했습니다. 계속되면 heektime@heek.kr 로 문의 부탁드립니다.`
              );
              break;
          }
          return false;
        },
        () => true
      )
    );
    if (!registerSucceed) {
      setLoading(false);
      return;
    }

    const loginToken = pipe(
      await login(email, password),
      fold(() => null, identity)
    );
    if (loginToken == null) {
      // TODO: Unexpected
      setLoading(false);
      navigate({ pathname: '/sign-in/', search: searchParams.toString() });
      return;
    }

    try {
      await signInWithCustomToken(auth, loginToken);
    } catch (err) {
      if (!(err instanceof FirebaseError)) {
        throw err;
      }
      // TODO: Unexpected
      setLoading(false);
      navigate({ pathname: '/sign-in/', search: searchParams.toString() });
      return;
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent): Promise<void> => {
    if (e.key === 'Enter') {
      await handleClickSubmit();
    }
  };

  return (
    <div className={styles.container}>
      <h2>회원가입</h2>
      <div className={styles.form}>
        <label>
          <span className={styles.label}>이메일</span>
          <input
            type="email"
            placeholder="exmaple@example.com"
            className={classNames({
              [styles.invalid]: displayingError?.path === 'email',
            })}
            value={email}
            onChange={handleChangeEmail}
          />
          {displayingError?.path === 'email' && (
            <Error>{displayingError.message}</Error>
          )}
        </label>
        <label>
          <span className={styles.label}>비밀번호 (6자 이상)</span>
          <input
            type="password"
            placeholder="********"
            className={classNames({
              [styles.invalid]: displayingError?.path === 'password',
            })}
            value={password}
            onChange={handleChangePassword}
            onKeyDown={handleKeyDown}
            {...{ passwordrules: 'minlength: 6;' }}
          />
          {displayingError?.path === 'password' && (
            <Error>{displayingError.message}</Error>
          )}
        </label>

        <p>
          버튼을 눌러 가입하면{' '}
          <Link to="/policy/" target="_blank">
            서비스 정책 및 이용약관
          </Link>
          에 동의하는 것입니다.
        </p>
        <button
          className={styles.primary}
          disabled={disabled}
          onClick={handleClickSubmit}
        >
          {isLoading ? <Loading inline /> : '가입'}
        </button>
        {errorMessage !== undefined && <Error>{errorMessage}</Error>}
      </div>
    </div>
  );
};

export default RegisterPage;
