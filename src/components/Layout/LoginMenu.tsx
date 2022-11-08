import React, { useContext } from 'react';
import { Link, resolvePath, useLocation } from 'react-router-dom';

import { LoginContext } from '../../contexts/login';
import styles from './LoginMenu.module.scss';

const LoginMenu = (): React.ReactElement => {
  const login = useContext(LoginContext);

  const location = useLocation();
  const search = new URLSearchParams({
    redirect: `${location.pathname}${location.search}${location.hash}`,
  });

  return (
    <div className={styles.wrapper}>
      {login != null ? (
        <>
          <div className={styles.profileBox}>{login.user.username}</div>
          <Link
            to="/sign-out/"
            state={{ skipModal: true }}
            className={styles.actionLink}
          >
            로그아웃
          </Link>
        </>
      ) : (
        <>
          <Link
            to={resolvePath(
              { pathname: '/sign-up/', search: search.toString() },
              '/'
            )}
            className={styles.actionLink}
          >
            회원가입
          </Link>
          <Link
            to={resolvePath(
              { pathname: '/sign-in/', search: search.toString() },
              '/'
            )}
            className={styles.actionLink}
          >
            로그인
          </Link>
        </>
      )}
    </div>
  );
};

export default LoginMenu;
