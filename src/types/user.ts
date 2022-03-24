import * as t from 'io-ts';

import { timestampReferenceWithServerDefaultCodec } from './utils';

const userCodec = t.type({
  username: t.string,
  createdAt: timestampReferenceWithServerDefaultCodec,
  updatedAt: timestampReferenceWithServerDefaultCodec,
});

export { userCodec };
export type User = t.TypeOf<typeof userCodec>;
