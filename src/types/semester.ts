import * as t from 'io-ts';

import { optional } from './utils';

const periodCodec = t.type({
  period: t.number,
  timeBegin: t.number,
  timeEnd: t.number,
});

const semesterCodec = t.type({
  year: t.number,
  term: t.string,
  periods: t.array(periodCodec),
  lecturesUrl: optional(t.string),
});

export { periodCodec, semesterCodec };
export type Period = t.TypeOf<typeof periodCodec>;
export type Semester = t.TypeOf<typeof semesterCodec>;
