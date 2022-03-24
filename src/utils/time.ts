import {
  BaseLecture,
  LectureTime,
  Period,
  Time,
  toLocalizedShortName,
} from '../types';

export const isRangeOverlap = (
  [x1, x2]: [number, number],
  [y1, y2]: [number, number],
  detectEqual = false
): boolean => {
  if (detectEqual) {
    return x1 <= y2 && y1 <= x2;
  }
  return x1 < y2 && y1 < x2;
};

export const isOverlap = (
  lecture: BaseLecture,
  filledTimes: Time[]
): boolean => {
  if (!filledTimes || !lecture.times) {
    return false;
  }

  for (const t0 of filledTimes) {
    if (t0.timeBegin == null || t0.timeEnd == null) {
      continue;
    }
    for (const t1 of lecture.times) {
      if (t1.timeBegin == null || t1.timeEnd == null) {
        continue;
      }
      if (
        t0.weekday === t1.weekday &&
        isRangeOverlap([t0.timeBegin, t0.timeEnd], [t1.timeBegin, t1.timeEnd])
      ) {
        return true;
      }
    }
  }
  return false;
};

export const getPeriod = (
  time: number,
  periods: Period[],
  includesEnd?: boolean
): Period | undefined => {
  const check: (lower: number, upper: number, value: number) => boolean =
    includesEnd === true
      ? (lower, upper, value): boolean => lower <= value && value <= upper
      : (lower, upper, value): boolean => lower <= value && value < upper;

  for (const period of periods.sort((a, b) => b.timeBegin - a.timeBegin)) {
    if (check(period.timeBegin, period.timeEnd, time)) {
      return period;
    }
  }
};

const pad = (value: number): string =>
  `${value}`.length === 1 ? `0${value}` : `${value}`;

export const formatTimes = (
  times: LectureTime[],
  periods: Period[]
): string => {
  const formattedTimes = times
    .map((time) => {
      const weekday =
        time.weekday != null && toLocalizedShortName(time.weekday);

      let begin: string | undefined;
      if (time.timeBegin != null) {
        const period = getPeriod(time.timeBegin, periods);
        if (period != null) {
          begin = `${period.period}`;
        } else {
          const hour = pad(Math.floor(time.timeBegin / 60));
          const minute = pad(time.timeBegin % 60);
          begin = `${hour}:${minute}`;
        }
      }

      let end: string | undefined;
      if (time.timeEnd != null) {
        const period = getPeriod(time.timeEnd, periods, true);
        if (period != null) {
          end = `${period.period}`;
        } else {
          const hour = pad(Math.floor(time.timeEnd / 60));
          const minute = pad(time.timeEnd % 60);
          end = `${hour}:${minute}`;
        }
      }

      return [weekday, begin, begin !== end && '-', begin !== end && end]
        .filter(Boolean)
        .join('');
    })
    .filter((value) => value != null);
  return formattedTimes.join(', ');
};
