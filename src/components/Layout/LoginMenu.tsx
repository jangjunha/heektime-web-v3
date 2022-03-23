import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import { LoginContext } from '../../contexts/login';
import styles from './LoginMenu.module.scss';

const LoginMenu = (): React.ReactElement => {
  const [authUser, user] = useContext(LoginContext);

  return (
    <div className={styles.wrapper}>
      {authUser != null ? (
        <>
          <div className={styles.profileBox}>
            {user != null ? (
              user.username
            ) : (
              <span className={styles.email}>({authUser.email})</span>
            )}
          </div>
          <Link
            to="/sign-out/"
            state={{ skipModal: true }}
            className={styles.actionLink}
          >
            로그아웃
          </Link>
        </>
      ) : (
        <Link to="/sign-in/" className={styles.actionLink}>
          로그인
        </Link>
      )}
    </div>
  );
};

export default LoginMenu;
