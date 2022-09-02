import { EventAttributes, createEvents } from 'ics';
import { DateTime, MonthNumbers } from 'luxon';
import { useContext } from 'react';

import {
  LectureTime,
  Semester,
  Timetable,
  UserLecture,
} from '../../../../../types';
import {
  Weekday,
  fromLuxonWeekday,
  toLuxonWeekday,
  toRRuleWeekday,
  weekdayCodec,
} from '../../../../../types/weekday';
import { TimetableContext } from '../contexts';

type RequiredProperties<T, P extends keyof T> = Omit<T, P> & {
  [Q in P]: NonNullable<T[Q]>;
};

const asc = (a: number, b: number): number => a - b;

const getSemesterRange = (semester: Semester): [DateTime, DateTime] => {
  const [monthBegin, monthEnd] = ((
    semester: Semester
  ): [MonthNumbers, MonthNumbers] => {
    switch (semester.term) {
      case '1학기':
      case '봄학기':
        return [3, 6];
      case '여름학기':
        return [6, 8];
      case '2학기':
      case '가을학기':
        return [9, 12];
      case '겨울학기':
        return [12, 2];
      default:
        throw new Error('Invalid semester.term');
    }
  })(semester);
  const begin = DateTime.local(semester.year, monthBegin, {
    zone: 'Asia/Seoul',
  });
  const end = begin.set({ month: monthEnd }).endOf('month');
  return [begin, end];
};

const build = (
  [timetableID, timetable]: [string, Timetable],
  lectures: [string, UserLecture][],
  semester: Semester
): Blob => {
  const sequence = new Date().getTime();
  const [semesterBegin, semesterEnd] = getSemesterRange(semester);

  const events: EventAttributes[] = lectures.flatMap(([lectureID, lecture]) => {
    // Filter valid times
    type ValidTime = RequiredProperties<LectureTime, 'weekday' | 'timeBegin'>;
    const validTimes: ValidTime[] = lecture.times.filter(
      (t): t is ValidTime =>
        t.weekday !== undefined && t.timeBegin !== undefined
    );
    const duration = (t: ValidTime): number =>
      (t.timeEnd ?? t.timeBegin) - t.timeBegin;

    // Group by (duration, room)
    const grouped = validTimes.reduce(
      (group: { [key: string]: ValidTime[] }, time) => {
        const room = time.room ?? '';
        const key = [duration(time), room].join('-');
        (group[key] = group[key] ?? []).push(time);
        return group;
      },
      {}
    );

    return Object.entries(grouped).map(([groupKey, times]): EventAttributes => {
      const start = DateTime.min(
        ...times.map((time) =>
          semesterBegin.plus({
            days:
              (toLuxonWeekday(time.weekday) - semesterBegin.weekday + 7) % 7,
            minutes: time.timeBegin,
          })
        )
      );
      const wkst: Weekday = fromLuxonWeekday(start.weekday);
      const room = times[0].room || undefined;

      const weekdaySortKey = (w: Weekday): number =>
        (weekdayCodec.encode(w) - weekdayCodec.encode(wkst) + 7) % 7;
      const weekdays = Array.from(new Set(times.map((t) => t.weekday)))
        .sort((a, b) => weekdaySortKey(a) - weekdaySortKey(b))
        .map(toRRuleWeekday);
      const hours = Array.from(
        new Set(times.map((t) => Math.floor(t.timeBegin / 60)))
      ).sort(asc);
      const minutes = Array.from(
        new Set(times.map((t) => t.timeBegin % 60))
      ).sort();
      // ex) WKST=TH;BYDAY=TU,TH;BYHOUR=14,15;BYMINUTE=0,30;BYSETPOS=4,5
      const bysetpos = times
        .map(({ weekday, timeBegin }) => {
          const wk = toRRuleWeekday(weekday);
          const hour = Math.floor(timeBegin / 60);
          const minute = timeBegin % 60;

          const wi = weekdays.indexOf(wk);
          const hi = hours.indexOf(hour);
          const mi = minutes.indexOf(minute);
          if (wi < 0 || hi < 0 || mi < 0) {
            throw new Error(
              `Unexpected error. Either wi=${wi}, hi=${hi} or mi=${mi} is less than zero.`
            );
          }
          return (
            1 + mi + hi * minutes.length + wi * (hours.length * minutes.length)
          );
        })
        .sort();
      const rule: [string, string][] = [
        ['FREQ', 'WEEKLY'],
        ['UNTIL', semesterEnd.toUTC().toFormat("yyyyMMdd'T'HHmmss'Z'")],
      ];
      if (weekdays.length > 1) {
        rule.push(['WKST', toRRuleWeekday(wkst)]);
        rule.push(['BYDAY', weekdays.join(',')]);
      }
      if (hours.length > 1) {
        rule.push(['BYHOUR', hours.join(',')]);
      }
      if (minutes.length > 1) {
        rule.push(['BYMINUTE', minutes.join(',')]);
      }
      if (weekdays.length * hours.length * minutes.length !== bysetpos.length) {
        rule.push(['BYSETPOS', bysetpos.join(',')]);
      }
      return {
        productId: '-//heek.kr//heektime',
        uid:
          [timetableID, lecture.identifier ?? lectureID, groupKey]
            .map(encodeURIComponent)
            .join('+') + '@ical.heektime.heek.kr',
        sequence,

        title: lecture.title,
        start: [start.year, start.month, start.day, start.hour, start.minute],
        startOutputType: 'local',
        duration: {
          minutes: duration(times[0]),
        },
        location: room,
        recurrenceRule: rule.map(([k, v]) => `${k}=${v}`).join(';'),
      };
    });
  });

  const res = createEvents(events);
  if (res.value === undefined) {
    throw new Error('Failed to create events');
  }
  return new Blob([res.value], { type: 'text/calendar' });
};

export const useDownloadICS = (): (() => void) | undefined => {
  const { timetable, lectures, semester } = useContext(TimetableContext);
  if (lectures === undefined || semester === undefined) {
    return undefined;
  }
  return () => {
    const blob = build(timetable, lectures, semester);
    window.open(URL.createObjectURL(blob), '_blank');
  };
};
