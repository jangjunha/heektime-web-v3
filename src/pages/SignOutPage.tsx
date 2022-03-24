import { signOut } from 'firebase/auth';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Layout from '../components/Layout';
import { auth } from '../firebase';

interface State {
  skipModal: boolean;
}

const isState = (u: unknown): u is State =>
  typeof u === 'object' && u != null && 'skipModal' in u;

const SignOutPage = (): React.ReactElement => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = async (): Promise<void> => {
    await signOut(auth);
    navigate('/', { replace: true });
  };

  if (isState(location.state) && location.state.skipModal) {
    handleClick();
  }

  return (
    <Layout>
      <p>로그아웃 하시겠습니까?</p>
      <button onClick={handleClick}>Sign-Out</button>
    </Layout>
  );
};

export default SignOutPage;
