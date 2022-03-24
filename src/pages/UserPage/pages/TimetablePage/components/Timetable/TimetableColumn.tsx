import React from 'react';

import { TimetableItemModel } from '.';
import { LectureTime } from '../../../../../../types';
import { isRangeOverlap } from '../../../../../../utils/time';
import styles from './TimetableColumn.module.scss';
import { TimetableItem } from './TimetableItem';
import { TimetableRow } from './TimetableRow';

interface TimetableColumnProps {
  readonly header?: boolean;
  readonly headerVal?: string | number;

  readonly items?: readonly TimetableItemModel[];
  readonly previews?: readonly TimetableItemModel[];

  readonly beginHour?: number;
  readonly endHour?: number;

  readonly editable?: boolean;
  readonly isEditing?: boolean;

  onDeleteLecture?: (lectureID: string) => void;
}

export const TimetableColumn = (
  props: TimetableColumnProps
): React.ReactElement => {
  const {
    header = false,
    headerVal,
    items = [],
    previews = [],
    beginHour: beginHourProp = 9,
    endHour: endHourProp = 19,
    editable = false,
    isEditing = false,
    onDeleteLecture,
  } = props;

  const beginHour = Math.max(Math.min(beginHourProp, 24), 0);
  const endHour = Math.max(Math.min(endHourProp, 24), 0);
  const timeRows = Math.max(endHour - beginHour, 5);

  const toRelative = (minute: number): number => minute - beginHour * 60;
  const toPercent = (minute: number): string => `${(minute / 60) * 100}%`;
  const styleForItem = (item: TimetableItemModel): React.CSSProperties => ({
    left: 0,
    right: 0,
    top: toPercent(toRelative(item.time.timeBegin || 0)),
    height: `calc(${toPercent(
      (item.time.timeEnd || 0) - (item.time.timeBegin || 0)
    )} + 1px)`,
  });
  const isOverlap = (target: LectureTime): boolean => {
    return (
      items.find((item) => {
        const { time: elem } = item;
        if (
          target.timeBegin == null ||
          target.timeEnd == null ||
          elem.timeBegin == null ||
          elem.timeEnd == null
        ) {
          return false;
        }
        return isRangeOverlap(
          [target.timeBegin, target.timeEnd],
          [elem.timeBegin, elem.timeEnd]
        );
      }) != null
    );
  };

  const hours = Array(timeRows)
    .fill(undefined)
    .map((_, i) => beginHour + i);
  const allItems = [
    ...items,
    ...previews.map((item) => ({ ...item, preview: true })),
  ];

  const rows = hours.map((hour) => (
    <div className={styles.rowTime} key={hour}>
      <TimetableRow header={false} headerVal={header ? hour : undefined} />
    </div>
  ));

  const timetableItems = allItems.map((item) => {
    const handleDelete = (): void => {
      if (onDeleteLecture) {
        onDeleteLecture(item.lectureID);
      }
    };
    const className = [
      styles.timetableItem,
      item.isPreview && styles.preview,
      item.isPreview && isOverlap(item.time) && styles.overlapped,
    ]
      .filter((elem) => elem)
      .join(' ');
    const key = [
      item.lectureID,
      item.time.weekday,
      item.time.timeBegin,
      item.time.timeEnd,
      item.time.room,
    ].join('-');

    return (
      <div key={key} className={className} style={styleForItem(item)}>
        <TimetableItem
          item={item}
          editable={editable}
          isEditing={isEditing}
          onDelete={handleDelete}
        />
      </div>
    );
  });

  return (
    <div className={`${styles.col} ${header ? styles.headerCol : ''}`}>
      <TimetableRow header={true} headerVal={headerVal} />
      <div className={styles.timesWrapper}>
        {rows}
        {/* Size guide for items */}
        <div
          className={styles.itemsWrapper}
          style={{ height: `${100 / timeRows}%` }}
        >
          {timetableItems}
        </div>
      </div>
    </div>
  );
};
