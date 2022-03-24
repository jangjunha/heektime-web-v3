import * as t from 'io-ts';

import { documentReferenceCodec, timestampReferenceCodec } from './utils';

const visibilityCodec = t.keyof({
  public: null,
  private: null,
});

const timetableCodec = t.type({
  title: t.string,
  visibility: visibilityCodec,
  semester: documentReferenceCodec,
  createdAt: timestampReferenceCodec,
  updatedAt: timestampReferenceCodec,
});

export { timetableCodec };
export type Timetable = t.TypeOf<typeof timetableCodec>;
