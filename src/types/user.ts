import * as t from 'io-ts';

import { TimestampReferenceCodec } from './utils';

const userCodec = t.type({
  username: t.string,
  createdAt: TimestampReferenceCodec,
  updatedAt: TimestampReferenceCodec,
});

export { userCodec };
export type User = t.TypeOf<typeof userCodec>;
