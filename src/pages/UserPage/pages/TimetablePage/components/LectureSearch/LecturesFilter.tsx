import classNames from 'classnames';
import React, { useState } from 'react';

import {
  Weekday,
  allWeekdaysFromMonday,
  toLocalizedShortName,
} from '../../../../../../types';
import styles from './LecturesFilter.module.scss';

interface LecturesFilterProps {
  isSearching?: boolean;

  // Filters
  keyword?: string;
  filterEmptyTimes?: boolean;
  filterWeekdays?: Weekday[];

  // Handlers
  onChangeFilterKeyword?: (keyword: string) => void;
  onChangeFilterEmptyTimes?: (isOn: boolean) => void;
  onChangeFilterWeekdays?: (weekdays: Weekday[]) => void;
}

export const LecturesFilter = (
  props: LecturesFilterProps
): React.ReactElement => {
  const {
    isSearching,
    keyword,
    filterEmptyTimes,
    filterWeekdays,
    onChangeFilterKeyword,
    onChangeFilterEmptyTimes,
    onChangeFilterWeekdays,
  } = props;

  const handleChangeKeyword = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    if (onChangeFilterKeyword == null) {
      return;
    }
    onChangeFilterKeyword(event.target.value);
  };

  const handleClickFilterEmptyTimes = (): void => {
    if (onChangeFilterEmptyTimes == null) {
      return;
    }
    onChangeFilterEmptyTimes(!filterEmptyTimes);
  };

  const [expandsFilterWeekdays, setExpandsFilterWeekdays] = useState(false);
  const handleClickFilterWeekdays = (): void => {
    setExpandsFilterWeekdays(!expandsFilterWeekdays);
    if (onChangeFilterWeekdays != null) {
      onChangeFilterWeekdays(
        expandsFilterWeekdays ? [] : allWeekdaysFromMonday
      );
    }
  };
  const isWeekdaysFilterOn =
    filterWeekdays != null && filterWeekdays.length > 0;
  const handleChangeWeekdays = (weekdays: Weekday[]): void => {
    if (onChangeFilterWeekdays == null) {
      return;
    }
    onChangeFilterWeekdays(weekdays);
  };

  const weekdayFilter = (
    <WeekdayFilter
      weekdays={filterWeekdays || []}
      onChangeWeekdays={handleChangeWeekdays}
    />
  );

  return (
    <div className={styles.container}>
      <div
        className={classNames(styles.searchWrapper, {
          [styles.searching]: isSearching,
        })}
      >
        <input
          type="text"
          className={styles.searchBox}
          placeholder="강의명 / 학수번호 / 교수명 검색"
          value={keyword}
          onChange={handleChangeKeyword}
        />
      </div>
      <ul className={styles.filtersWrapper}>
        <li>
          <p
            className={classNames(styles.toggleText, {
              [styles.on]: filterEmptyTimes,
            })}
            onClick={handleClickFilterEmptyTimes}
          >
            빈 시간대만
          </p>
        </li>
        <li>
          <p
            className={classNames(styles.toggleText, {
              [styles.on]: isWeekdaysFilterOn,
            })}
            onClick={handleClickFilterWeekdays}
          >
            요일
          </p>
          {expandsFilterWeekdays && weekdayFilter}
        </li>
      </ul>
    </div>
  );
};

interface WeekdayFilterProps {
  weekdays: Weekday[];
  onChangeWeekdays?: (weekdays: Weekday[]) => void;
}

const WeekdayFilter = (props: WeekdayFilterProps): React.ReactElement => {
  const { weekdays, onChangeWeekdays } = props;

  const makeHandler = (weekday: Weekday) => (): void => {
    if (onChangeWeekdays == null) {
      return;
    }
    const set = new Set(weekdays);
    if (set.has(weekday)) {
      set.delete(weekday);
    } else {
      set.add(weekday);
    }
    onChangeWeekdays(Array.from(set));
  };
  const items = allWeekdaysFromMonday.map((weekday) => (
    <li
      key={weekday}
      onClick={makeHandler(weekday)}
      className={classNames({ [styles.on]: weekdays.includes(weekday) })}
    >
      {toLocalizedShortName(weekday)}
    </li>
  ));

  return <ul className={styles.weekdaysFilter}>{items}</ul>;
};
