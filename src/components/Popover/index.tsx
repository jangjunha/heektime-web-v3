import React, { useRef, useState } from 'react';

import styles from './index.module.scss';

interface PopoverProps {
  children?: React.ReactNode;
  menu?: React.ReactNode;
}

const Popover = ({ children, menu }: PopoverProps): React.ReactElement => {
  const [isOpen, setOpen] = useState(false);

  const handleClickContent = (): void => {
    setOpen((prev) => !prev);
  };

  const menuWrapperRef = useRef<HTMLDivElement>(null);
  const handleBlur = (event: React.FocusEvent<HTMLDivElement>): void => {
    if (
      menuWrapperRef.current === null ||
      !menuWrapperRef.current.contains(event.relatedTarget)
    ) {
      setOpen(false);
    }
  };

  return (
    <div className={styles.container} onBlur={handleBlur}>
      <div
        className={styles.contentWrapper}
        onClick={handleClickContent}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {children}
      </div>
      <div className={styles.menuWrapper} ref={menuWrapperRef}>
        {isOpen && <div className={styles.menu}>{menu}</div>}
      </div>
    </div>
  );
};

export default Popover;
