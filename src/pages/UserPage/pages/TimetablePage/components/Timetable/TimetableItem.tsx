import classNames from 'classnames';
import React from 'react';

import { TimetableItemModel } from '.';
import styles from './TimetableItem.module.scss';

interface TimetableItemProps {
  item: TimetableItemModel;
  editable?: boolean;
  onDelete?: () => void;

  readonly isEditing?: boolean;
}

export const TimetableItem = (
  props: TimetableItemProps
): React.ReactElement => {
  const { item, editable = false, isEditing = false } = props;

  const handleClickDelete = (): void => {
    if (window.confirm('정말 삭제하시겠습니까?') && props.onDelete) {
      props.onDelete();
    }
  };

  const menu = (
    <ul className={styles.overlayMenu}>
      <li>
        <button
          disabled={isEditing}
          onClick={handleClickDelete}
          className={classNames({ [styles.editing]: isEditing })}
        >
          <i className="material-icons">close</i>
        </button>
      </li>
    </ul>
  );

  const className = classNames(styles.timetableItem, {
    [styles.preview]: item.isPreview,
  });
  return (
    <div className={className}>
      {editable && menu}
      <p className={styles.title}>{item.lecture.title}</p>
      {/* <p className={styles.meta}>{ item.lecture.professor }</p> */}
      <p className={styles.meta}>{item.time.room}</p>
    </div>
  );
};
