import React from 'react';
import { Route, Routes } from 'react-router-dom';

import './App.module.scss';
import { LoginProvider } from './context/login';
import HomePage from './pages/HomePage';
import SignInPage from './pages/SignInPage';
import SignOutPage from './pages/SignOutPage';

const App = (): React.ReactElement => {
  return (
    <div className="app">
      <LoginProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sign-in/" element={<SignInPage />} />
          <Route path="/sign-out/" element={<SignOutPage />} />
        </Routes>
      </LoginProvider>
    </div>
  );
};

export default App;
