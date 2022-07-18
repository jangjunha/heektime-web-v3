import React from 'react';
import { Link } from 'react-router-dom';

import Layout from '../../components/Layout';
import styles from './index.module.scss';

const NotFoundPage = (): React.ReactElement => {
  return (
    <Layout>
      <div className={styles.container}>
        <h1>페이지를 찾을 수 없습니다.</h1>
        <Link to="/">처음으로</Link>
      </div>
    </Layout>
  );
};

export default NotFoundPage;
