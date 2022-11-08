import { ErrorBoundary, FallbackRender } from '@sentry/react';
import React, { useState } from 'react';
import { Outlet, Route } from 'react-router-dom';

import { SentryRoutes } from '.';
import './App.module.scss';
import {
  LoginProvider,
  _FirebaseAuthProvider,
  _UserDocumentProvider,
} from './contexts/login';
import ErrorPage from './pages/ErrorPage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import PolicyPage from './pages/PolicyPage';
import SignInPage from './pages/SignInPage';
import SignOutPage from './pages/SignOutPage';
import SignUpPage from './pages/SignUpPage';
import UserPage from './pages/UserPage';

const RaisingErrorComponent = (): React.ReactElement => {
  const [error, setError] = useState(false);
  const generateError = (): void => setError(true);
  if (error) throw new Error('test');
  return (
    <div>
      <button onClick={generateError}>Generate Error</button>
    </div>
  );
};

const renderFallback: FallbackRender = (errorData) => (
  <ErrorPage {...errorData} />
);

const App = (): React.ReactElement => {
  return (
    <div className="app">
      {/* eslint-disable-next-line react/jsx-pascal-case */}
      <_FirebaseAuthProvider>
        {/* eslint-disable-next-line react/jsx-pascal-case */}
        <_UserDocumentProvider>
          <ErrorBoundary fallback={renderFallback}>
            <Page />
            <div id="modal" />
          </ErrorBoundary>
        </_UserDocumentProvider>
      </_FirebaseAuthProvider>
    </div>
  );
};

const LoginProvided = (): React.ReactElement => (
  <LoginProvider>
    <Outlet />
  </LoginProvider>
);

const Page = (): React.ReactElement => (
  <SentryRoutes>
    <Route path="sign-up/*" element={<SignUpPage />} />
    <Route path="*" element={<LoginProvided />}>
      <Route index element={<HomePage />} />
      <Route path="user/:username/*" element={<UserPage />} />
      <Route path="sign-in/" element={<SignInPage />} />
      <Route path="sign-out/" element={<SignOutPage />} />
      <Route path="policy/" element={<PolicyPage />} />
      <Route path="_error/" element={<RaisingErrorComponent />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </SentryRoutes>
);

export default App;
