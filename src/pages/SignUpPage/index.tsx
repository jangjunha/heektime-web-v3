import React from 'react';
import { Route } from 'react-router-dom';

import { SentryRoutes } from '../..';
import Layout from '../../components/Layout';
import CreateUserInfoPage from './pages/CreateUserInfoPage';
import IndexPage from './pages/IndexPage';
import RegisterPage from './pages/RegisterPage';

const SignUpPage = (): React.ReactElement => (
  <Layout>
    <SentryRoutes>
      <Route index element={<IndexPage />} />
      <Route path="register/" element={<RegisterPage />} />
      <Route path="create-user-info/" element={<CreateUserInfoPage />} />
    </SentryRoutes>
  </Layout>
);

export default SignUpPage;
