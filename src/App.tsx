import { ErrorBoundary, FallbackRender } from '@sentry/react';
import React, { useState } from 'react';
import { Route } from 'react-router-dom';

import { SentryRoutes } from '.';
import './App.module.scss';
import { LoginProvider } from './contexts/login';
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
      <LoginProvider>
        <ErrorBoundary fallback={renderFallback}>
          <SentryRoutes>
            <Route index element={<HomePage />} />
            <Route path="user/:username/*" element={<UserPage />} />
            <Route path="sign-up/*" element={<SignUpPage />} />
            <Route path="sign-in/" element={<SignInPage />} />
            <Route path="sign-out/" element={<SignOutPage />} />
            <Route path="policy/" element={<PolicyPage />} />
            <Route path="_error/" element={<RaisingErrorComponent />} />
            <Route path="*" element={<NotFoundPage />} />
          </SentryRoutes>
          <div id="modal" />
        </ErrorBoundary>
      </LoginProvider>
    </div>
  );
};

export default App;
