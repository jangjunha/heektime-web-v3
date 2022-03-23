import React from 'react';

import LoginMenu from './LoginMenu';
import TopMenu from './TopMenu';
import styles from './index.module.scss';

const Layout = ({
  menu,
  children,
}: {
  menu?: React.ReactNode;
  children?: React.ReactNode;
}): React.ReactElement => (
  <div className={styles.container}>
    <div className={styles.header}>
      <TopMenu left={menu} right={<LoginMenu />} />
    </div>
    <div className={styles.content}>{children}</div>
  </div>
);

export default Layout;
