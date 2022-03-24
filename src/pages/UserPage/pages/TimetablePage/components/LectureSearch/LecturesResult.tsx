import classNames from 'classnames';
import React, { CSSProperties, useCallback, useMemo } from 'react';
import AutoSizer, { Size } from 'react-virtualized-auto-sizer';
import { FixedSizeList, ListChildComponentProps } from 'react-window';

import { MasterLecture, Period, Time } from '../../../../../../types';
import {
  formatTimes,
  isOverlap as isTimeOverlap,
} from '../../../../../../utils/time';
import styles from './LecturesResult.module.scss';

interface LecturesResultProps {
  lectures: MasterLecture[];
  periods: Period[];
  filledTimes?: Time[];
  onSelectLecture?: (lecture: MasterLecture) => void;
  onChangePreviewLecture?: (lecture?: MasterLecture) => void;
}

export const LecturesResult = ({
  lectures,
  periods,
  filledTimes = [],
  onSelectLecture,
  onChangePreviewLecture,
}: LecturesResultProps): React.ReactElement => {
  const makeHandleClick = useCallback(
    (lecture: MasterLecture) => (): void => {
      if (onSelectLecture == null) {
        return;
      }
      onSelectLecture(lecture);
    },
    [onSelectLecture]
  );

  const makeHandleMouseOver = useCallback(
    (lecture?: MasterLecture) => (): void => {
      onChangePreviewLecture?.(lecture);
    },
    [onChangePreviewLecture]
  );

  const renderLectureRow = useMemo(() => {
    console.log('memo renderLectureRow', lectures.length);
    return ({ index, style }: ListChildComponentProps): React.ReactElement => {
      const lecture = lectures[index];
      const isOverlap = isTimeOverlap(lecture, filledTimes);
      return (
        <div
          style={style}
          onClick={makeHandleClick(lecture)}
          onMouseLeave={makeHandleMouseOver(undefined)}
          onMouseOver={makeHandleMouseOver(lecture)}
        >
          <LectureRow
            lecture={lecture}
            periods={periods}
            isOverlap={isOverlap}
            index={index}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      );
    };
  }, [lectures, periods, filledTimes, makeHandleClick, makeHandleMouseOver]);

  const renderLectures = ({ width, height }: Size): React.ReactElement => (
    <FixedSizeList
      width={width}
      height={height}
      itemCount={lectures.length}
      itemSize={38}
      overscanCount={10}
    >
      {renderLectureRow}
    </FixedSizeList>
  );

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div
          className={classNames([
            styles.col,
            styles.headerCol,
            styles.colIdentifier,
          ])}
        >
          <p>학수번호</p>
        </div>
        <div
          className={classNames([
            styles.col,
            styles.headerCol,
            styles.colTitle,
          ])}
        >
          <p>강의명</p>
        </div>
        <div
          className={classNames([
            styles.col,
            styles.headerCol,
            styles.colProfessor,
          ])}
        >
          <p>교수</p>
        </div>
        <div
          className={classNames([
            styles.col,
            styles.headerCol,
            styles.colCredit,
          ])}
        >
          <p>학점</p>
        </div>
        <div
          className={classNames([
            styles.col,
            styles.headerCol,
            styles.colTimes,
          ])}
        >
          <p>시간</p>
        </div>
        <div
          className={classNames([styles.col, styles.headerCol, styles.colRoom])}
        >
          <p>강의실</p>
        </div>
      </div>
      <div className={styles.lecturesWrapper}>
        <AutoSizer>{renderLectures}</AutoSizer>
      </div>
    </div>
  );
};

interface LectureRowProps {
  lecture: MasterLecture;
  periods: Period[];
  isOverlap?: boolean;
  index: number;
  style: CSSProperties;
}

const LectureRow = (props: LectureRowProps): React.ReactElement => {
  const { lecture, periods, isOverlap = false, index, style } = props;
  const className = classNames(styles.lectureRow, {
    [styles.colored]: index % 2 !== 0,
    [styles.overlapped]: isOverlap,
  });
  console.log('render LectureRow');
  return (
    <div className={className} style={style}>
      <div className={classNames(styles.col, styles.colIdentifier)}>
        <p>{lecture.identifier}</p>
      </div>
      <div className={classNames(styles.col, styles.colTitle)}>
        <p>{lecture.title}</p>
      </div>
      <div className={classNames(styles.col, styles.colProfessor)}>
        <p>{lecture.professor}</p>
      </div>
      <div className={classNames(styles.col, styles.colCredit)}>
        <p>{lecture.credit}</p>
      </div>
      <div className={classNames(styles.col, styles.colTimes)}>
        <p>{formatTimes(lecture.times, periods)}</p>
      </div>
      <div className={classNames(styles.col, styles.colRoom)}>
        <p>
          {Array.from(new Set(lecture.times.map((time) => time.room))).join(
            ', '
          )}
        </p>
      </div>
    </div>
  );
};
