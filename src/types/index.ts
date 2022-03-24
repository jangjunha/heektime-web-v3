export type { Time, Space, LectureTime } from './lecture-time';
export type {
  BaseLecture,
  MasterLecture,
  UserLecture,
  TypedLecture,
  MetaTag,
} from './lecture';
export type { School } from './school';
export type { Semester, Period } from './semester';
export type { Timetable } from './timetable';
export type { User } from './user';
export type { Weekday } from './weekday';
export {
  allWeekdaysFromMonday,
  toShortName,
  toLocalizedShortName,
} from './weekday';
