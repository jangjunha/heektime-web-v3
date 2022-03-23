import * as t from 'io-ts';

import { DocumentReferenceCodec, TimestampReferenceCodec } from './utils';

const visibilityCodec = t.keyof({
  public: null,
  private: null,
});

const timetableCodec = t.type({
  title: t.string,
  visibility: visibilityCodec,
  semester: DocumentReferenceCodec,
  createdAt: TimestampReferenceCodec,
  updatedAt: TimestampReferenceCodec,
});

export { timetableCodec };
export type Timetable = t.TypeOf<typeof timetableCodec>;
