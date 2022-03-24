import React, { useContext } from 'react';

import { Loading } from '../../../../../../components';
import {
  BaseLecture,
  LectureTime,
  MasterLecture,
  UserLecture,
  Weekday,
  toShortName,
} from '../../../../../../types';
import { TimetableContext } from '../../contexts';
import { TimetableColumn } from './TimetableColumn';
import styles from './index.module.scss';

interface TimetableProps {
  readonly lectures: [string, UserLecture][];
  readonly editable: boolean;
  readonly isEditing?: boolean;
  readonly previews?: readonly [string, MasterLecture][];
  onDeleteLecture?: (id: string) => void;
}

// 시간표에 표시되는 단위
export interface TimetableItemModel {
  readonly time: LectureTime;
  readonly lectureID: string;
  readonly lecture: BaseLecture;
  readonly isPreview: boolean;
  readonly isOverlap: boolean;
}

const toItems = (
  lectures: readonly [string, BaseLecture][],
  isPreview: boolean
): TimetableItemModel[] =>
  lectures.reduce(
    (res: TimetableItemModel[], [id, lecture]) => [
      ...res,
      ...lecture.times.map((time) => ({
        time,
        lectureID: id,
        lecture,
        isPreview,
        isOverlap: false,
      })),
    ],
    []
  );

const weekdaySortOrder: Weekday[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

const requiredWeekdays: Weekday[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
];

function distinct<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

const Timetable = ({
  lectures,
  editable = false,
  isEditing = false,
  previews = [],
  onDeleteLecture,
}: TimetableProps): React.ReactElement => {
  const timetableItems = toItems(lectures, false);
  const previewItems = toItems(previews, true);
  const items = [...timetableItems, ...previewItems];

  const weekdayItems = (weekday: Weekday): TimetableItemModel[] =>
    timetableItems.filter((item) => item.time.weekday === weekday);
  const weekdayPreviewItems = (weekday: Weekday): TimetableItemModel[] =>
    previewItems.filter((item) => item.time.weekday === weekday);

  const usedWeekdays = items
    .map((item) => item.time.weekday)
    .filter((x): x is Weekday => x != null);
  const weekdays = distinct([...usedWeekdays, ...requiredWeekdays]).sort(
    (lhs, rhs) => weekdaySortOrder.indexOf(lhs) - weekdaySortOrder.indexOf(rhs)
  );

  const allTimes = items
    .flatMap((item) => [item.time.timeBegin, item.time.timeEnd])
    .filter((x): x is number => x != null);
  const beginHour = Math.floor(Math.min(...allTimes, 9 * 60) / 60);
  const endHour = Math.ceil(Math.max(...allTimes, 19 * 60) / 60);

  const columns = weekdays.map((weekday: Weekday) => {
    const handleDeleteLecture = (lectureID: string): void => {
      onDeleteLecture?.(lectureID);
    };
    return (
      <div className={styles.col} key={weekday}>
        <TimetableColumn
          beginHour={beginHour}
          endHour={endHour}
          headerVal={toShortName(weekday)}
          items={weekdayItems(weekday)}
          previews={weekdayPreviewItems(weekday)}
          editable={editable}
          isEditing={isEditing}
          onDeleteLecture={handleDeleteLecture}
        />
      </div>
    );
  });

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.timetable}>
          <div className={`${styles.col} ${styles.header}`}>
            <TimetableColumn
              beginHour={beginHour}
              endHour={endHour}
              header={true}
            />
          </div>
          {columns}
        </div>
      </div>
    </div>
  );
};

const ContextAwareTimetable = (
  props: Omit<TimetableProps, 'lectures'>
): React.ReactElement => {
  const { lectures } = useContext(TimetableContext);
  return lectures === undefined ? (
    <Loading />
  ) : (
    <Timetable {...props} lectures={lectures} />
  );
};

export default ContextAwareTimetable;
