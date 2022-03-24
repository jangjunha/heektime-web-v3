import React, { useContext } from 'react';
import { Link, resolvePath, useLocation } from 'react-router-dom';

import { LoginContext } from '../../contexts/login';
import styles from './LoginMenu.module.scss';

const LoginMenu = (): React.ReactElement => {
  const [authUser, user] = useContext(LoginContext);

  const location = useLocation();
  const search = new URLSearchParams({
    redirect: `${location.pathname}${location.search}${location.hash}`,
  });

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
