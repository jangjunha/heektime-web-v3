import classNames from 'classnames';
import React from 'react';

import styles from './TimetableRow.module.scss';

interface TimetableRowProps {
  header?: boolean;
  headerVal?: string | number;
}

export const TimetableRow = ({
  header,
  headerVal,
}: TimetableRowProps): React.ReactElement => (
  <div className={classNames(styles.row, { [styles.headerRow]: header })}>
    {headerVal && <span className={styles.header}>{headerVal}</span>}
  </div>
);
