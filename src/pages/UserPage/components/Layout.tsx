import React, { useContext } from 'react';
import { Link, useOutletContext } from 'react-router-dom';

import { UserContext } from '..';
import BaseLayout from '../../../components/Layout';
import styles from './Layout.module.scss';

const useBasePath = (): string => {
  const context = useOutletContext();
  if (typeof context !== 'string') {
    throw new Error('Unexpected context type');
  }
  return context;
};

const Layout = ({
  breadcrumb,
  menu,
  children,
}: {
  breadcrumb?: React.ReactNode;
  menu?: React.ReactNode;
  children?: React.ReactNode;
}): React.ReactElement => {
  const basePath = useBasePath();
  const [, user] = useContext(UserContext);

  return (
    <BaseLayout
      menu={
        <>
          <div className={styles.breadcrumbContainer}>
            <div className={styles.breadcrumb}>
              <Link to={basePath}>{user.username}</Link>
            </div>
            {breadcrumb}
          </div>
          {menu}
        </>
      }
    >
      {children}
    </BaseLayout>
  );
};

export { styles };
export default Layout;
