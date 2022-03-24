import React from 'react';
import { Route, Routes } from 'react-router-dom';

import './App.module.scss';
import { LoginProvider } from './contexts/login';
import HomePage from './pages/HomePage';
import PolicyPage from './pages/PolicyPage';
import SignInPage from './pages/SignInPage';
import SignOutPage from './pages/SignOutPage';
import SignUpPage from './pages/SignUpPage';
import UserPage from './pages/UserPage';

const App = (): React.ReactElement => {
  return (
    <div className="app">
      <LoginProvider>
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="user/:username/*" element={<UserPage />} />
          <Route path="sign-up/*" element={<SignUpPage />} />
          <Route path="sign-in/" element={<SignInPage />} />
          <Route path="sign-out/" element={<SignOutPage />} />
          <Route path="policy/" element={<PolicyPage />} />
        </Routes>
        <div id="modal" />
      </LoginProvider>
    </div>
  );
};

export default App;
