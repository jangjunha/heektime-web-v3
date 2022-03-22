import * as t from 'io-ts';
import { DateFromISOString } from 'io-ts-types';

import { DocumentReferenceCodec } from './utils';

const visibilityCodec = t.keyof({
  public: null,
  private: null,
});

const timetableCodec = t.type({
  title: t.string,
  visibility: visibilityCodec,
  semester: DocumentReferenceCodec,
  createdAt: DateFromISOString,
  updatedAt: DateFromISOString,
});

export { timetableCodec };
export type Timetable = t.TypeOf<typeof timetableCodec>;
