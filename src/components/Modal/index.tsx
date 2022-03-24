import React from 'react';
import { Portal } from 'react-portal';

import styles from './index.module.scss';

interface ModalProps {
  children?: React.ReactNode;
  onClose?: () => void;
}

const ModalContent = (props: ModalProps): React.ReactElement => {
  const handleClickContent = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ): void => {
    e.stopPropagation();
  };
  return (
    <>
      <div className={styles.outer} onClick={props.onClose}>
        <div className={styles.container}>
          <div className={styles.contentWrapper} onClick={handleClickContent}>
            {props.children}
          </div>
          <div className={styles.outerButtons}>
            <i className="material-icons" onClick={props.onClose}>
              close
            </i>
          </div>
        </div>
      </div>
      <div className={styles.background} />
    </>
  );
};

const Modal = (props: ModalProps): React.ReactElement => (
  <Portal node={document.getElementById('modal')}>
    <ModalContent {...props} />
  </Portal>
);

export default Modal;
