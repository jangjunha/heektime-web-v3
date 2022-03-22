import * as t from 'io-ts';
import { DateFromISOString } from 'io-ts-types';

const userCodec = t.type({
  username: t.string,
  createdAt: DateFromISOString,
  updatedAt: DateFromISOString,
});

export { userCodec };
export type User = t.TypeOf<typeof userCodec>;
