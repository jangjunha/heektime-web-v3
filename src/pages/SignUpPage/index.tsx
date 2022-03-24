import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Layout from '../../components/Layout';
import CreateUserInfoPage from './pages/CreateUserInfoPage';
import IndexPage from './pages/IndexPage';
import RegisterPage from './pages/RegisterPage';

const SignUpPage = (): React.ReactElement => (
  <Layout>
    <Routes>
      <Route index element={<IndexPage />} />
      <Route path="register/" element={<RegisterPage />} />
      <Route path="create-user-info/" element={<CreateUserInfoPage />} />
    </Routes>
  </Layout>
);

export default SignUpPage;
