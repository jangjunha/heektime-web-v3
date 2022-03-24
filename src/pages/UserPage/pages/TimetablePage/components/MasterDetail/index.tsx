import React from 'react';

import styles from './index.module.scss';

interface MasterDetailProps {
  master: React.ReactNode;
  detail?: React.ReactNode;
}

const MasterDetail = (props: MasterDetailProps): React.ReactElement => {
  const { master, detail } = props;
  return (
    <div className={styles.wrapper}>
      <div className={styles.masterContainer}>{master}</div>
      {detail && <div className={styles.detailContainer}>{detail}</div>}
    </div>
  );
};

export default MasterDetail;
