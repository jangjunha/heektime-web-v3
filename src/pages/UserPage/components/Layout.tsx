import React, { useContext } from 'react';
import { Link, useOutletContext } from 'react-router-dom';

import { UserContext } from '..';
import BaseLayout from '../../../components/Layout';

const useBasePath = (): string => {
  const context = useOutletContext();
  if (typeof context !== 'string') {
    throw new Error('Unexpected context type');
  }
  return context;
};

const Layout = ({
  menu,
  children,
}: {
  menu?: React.ReactNode;
  children?: React.ReactNode;
}): React.ReactElement => {
  const basePath = useBasePath();
  const [, user] = useContext(UserContext);

  return (
    <BaseLayout
      menu={
        <>
          <Link to={basePath}>{user.username}</Link>
          {menu}
        </>
      }
    >
      {children}
    </BaseLayout>
  );
};

export default Layout;
