import React, { useEffect, useState } from 'react';

import { variate } from '../../utils/emoji';
import styles from './index.module.scss';

const CHAR = '\u{1F3C3}';
const INTERVAL = 200;
const MAXLENGTH = 8;

const Loading = (): React.ReactElement => {
  const [chars, setChars] = useState(
    Array(MAXLENGTH)
      .fill('')
      .map(() => variate(CHAR))
  );

  const tick = (): void =>
    setChars((prev) => {
      let next = [...prev, variate(CHAR)];
      next = next.slice(Math.max(0, next.length - MAXLENGTH));
      return next;
    });

  useEffect(() => {
    const timerID = setInterval(tick, INTERVAL);
    return (): void => clearInterval(timerID);
  }, []);

  return (
    <div className={styles.container}>
      <p>{chars}</p>
    </div>
  );
};

export default Loading;
