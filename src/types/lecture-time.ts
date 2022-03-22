import * as t from 'io-ts';

import { optional } from './utils';
import { weekdayCodec } from './weekday';

const timeCodec = t.type({
  weekday: optional(weekdayCodec),
  timeBegin: optional(t.number),
  timeEnd: optional(t.number),
});

const spaceCodec = t.type({
  room: optional(t.string),
});

const lectureTimeCodec = t.intersection([timeCodec, spaceCodec]);

export { lectureTimeCodec };
export type Time = t.TypeOf<typeof timeCodec>;
export type Space = t.TypeOf<typeof spaceCodec>;
export type LectureTime = t.TypeOf<typeof lectureTimeCodec>;
