import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import Layout from '../components/Layout';
import { LoginContext } from '../contexts/login';

const HomePage = (): React.ReactElement => {
  const [authUser, user] = useContext(LoginContext);
  return (
    <Layout>
      Home
      <div>
        {authUser != null ? (
          <>
            {user != null && (
              <Link to={`/user/${user.username}`}>내 시간표 보러가기</Link>
            )}
            <Link to="sign-out" state={{ skipModal: true }}>
              Sign-Out
            </Link>
          </>
        ) : (
          <>
            <p>logged-out</p>
            <Link to="sign-in">Sign-In</Link>
          </>
        )}
      </div>
    </Layout>
  );
};

export default HomePage;
