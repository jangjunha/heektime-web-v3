import * as t from 'io-ts';
import { fromNullable } from 'io-ts-types';

import { lectureTimeCodec } from './lecture-time';
import { optional, timestampReferenceWithServerDefaultCodec } from './utils';

const metaNotExistingCodec = t.type({
  type: t.literal('not-existing-sample'),
});

const metaTagCodec = t.type({
  type: t.literal('tag'),
  name: optional(t.string),
});

const metaCodec = t.union([metaNotExistingCodec, metaTagCodec]);

const baseLectureCodec = t.type({
  identifier: optional(t.string),
  title: optional(t.string),
  professor: optional(t.string),
  credit: optional(t.number),
  times: fromNullable(t.array(lectureTimeCodec), []),
  category: fromNullable(t.array(t.string), []),
  metas: fromNullable(t.array(metaCodec), []),
});

const masterLectureCodec = t.intersection([
  baseLectureCodec,
  t.type({
    url: optional(t.string),
  }),
]);

const userLectureCodec = t.intersection([
  baseLectureCodec,
  t.type({
    createdAt: timestampReferenceWithServerDefaultCodec,
    updatedAt: timestampReferenceWithServerDefaultCodec,
  }),
]);

export { masterLectureCodec, userLectureCodec, metaTagCodec };
export type BaseLecture = t.TypeOf<typeof baseLectureCodec>;
export type MasterLecture = t.TypeOf<typeof masterLectureCodec>;
export type UserLecture = t.TypeOf<typeof userLectureCodec>;
export type TypedLecture =
  | { type: 'master'; lecture: MasterLecture }
  | { type: 'user'; lecture: UserLecture };
export type MetaTag = t.TypeOf<typeof metaTagCodec>;
