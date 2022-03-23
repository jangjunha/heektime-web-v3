import React from 'react';
import { Link } from 'react-router-dom';

import styles from './TopMenu.module.scss';

interface TopMenuProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
}

const TopMenu = (props: TopMenuProps): React.ReactElement => (
  <nav className={styles.navbar}>
    <div className={styles.leftSection}>
      <Link to="/" className={styles.logo}>
        HeekTime
      </Link>
      {props.left}
    </div>
    <div className={styles.rightSection}>{props.right}</div>
  </nav>
);

export default TopMenu;
