import classNames from 'classnames';
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as yup from 'yup';

import { Loading } from '../../../components';
import { LoginContext } from '../../../contexts/login';
import { db } from '../../../firebase';
import styles from './common.module.scss';

const schema = yup.object().shape({
  username: yup
    .string()
    .required('닉네임을 입력하세요.')
    .min(4, '닉네임은 4자 이상이어야 합니다.')
    .max(32, '닉네임은 32자 이하여야 합니다.'),
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

const CreateUserInfoPage = (): React.ReactElement => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [authUser, user] = useContext(LoginContext);
  useEffect(() => {
    if (user !== null) {
      navigate(searchParams.get('redirect') || '/', { replace: true });
    }
  }, [user, navigate, searchParams]);

  const [isLoading, setLoading] = useState(false);
  const [isValidationEnabled, enableValidation] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const [username, setUsername] = useState('');
  if (authUser === null) {
    navigate('/sign-up/', { replace: true });
    return <></>;
  }

  const validate = (): yup.ValidationError | undefined => {
    try {
      schema.validateSync({ username });
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

  const handleChangeUsername = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setUsername(e.target.value);
  };
  const handleClickSubmit = async (): Promise<void> => {
    if (error != null || disabled) {
      enableValidation(true);
      return;
    }

    setLoading(true);
    const userRef = doc(db, 'users', authUser.uid);
    const usernameRef = doc(db, 'indices', 'user', 'usernames', username);
    try {
      const error = await runTransaction(
        db,
        async (transaction): Promise<string | undefined> => {
          const usernameSnapshot = await transaction.get(usernameRef);
          if (usernameSnapshot.exists()) {
            return '이미 다른 회원이 사용 중인 닉네임입니다. 다른 닉네임을 사용해주세요.';
          }

          await transaction.set(userRef, {
            username,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          await transaction.set(usernameRef, {
            value: authUser.uid,
          });
        }
      );
      if (error !== undefined) {
        setErrorMessage(error);
      }
    } catch (err) {
      setErrorMessage('등록에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
    setLoading(false);
    // Will be redirected by context behavior + effect hook
  };

  const handleKeyDown = async (e: React.KeyboardEvent): Promise<void> => {
    if (e.key === 'Enter') {
      await handleClickSubmit();
    }
  };

  return (
    <div className={styles.container}>
      <h2>추가 정보 입력</h2>
      <p>닉네임 설정 후 서비스를 이용할 수 있습니다.</p>
      <br />

      <div className={styles.form}>
        <label>
          <span className={styles.label}>닉네임 (4자 이상)</span>
          <input
            type="text"
            className={classNames({
              [styles.invalid]: displayingError?.path === 'username',
            })}
            value={username}
            onChange={handleChangeUsername}
            onKeyDown={handleKeyDown}
          />
          {displayingError?.path === 'username' && (
            <Error>{displayingError.message}</Error>
          )}
        </label>
        <button
          className={styles.primary}
          disabled={disabled}
          onClick={handleClickSubmit}
        >
          {isLoading ? <Loading inline /> : '등록'}
        </button>
        {errorMessage !== undefined && <Error>{errorMessage}</Error>}
      </div>
    </div>
  );
};

export default CreateUserInfoPage;
