import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import { LoginContext } from '../context/login';

const HomePage = (): React.ReactElement => {
  const [authUser] = useContext(LoginContext);
  return (
    <div>
      Home
      <div>
        {authUser != null ? (
          <>
            <p>{authUser.uid}</p>
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
    </div>
  );
};

export default HomePage;
