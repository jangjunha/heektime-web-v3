import {
  DocumentReference,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import * as t from 'io-ts';
import { withEncode } from 'io-ts-types';

export function optional<A, O>(
  codec: t.Type<A, O, unknown>,
  name = `${codec.name} | undefined`
): t.Type<A | undefined, O | undefined, unknown> {
  return new t.Type(
    name,
    (u: unknown): u is A | undefined => u === undefined || codec.is(u),
    (u, c) => (u == null ? t.success(undefined) : codec.validate(u, c)),
    (a) => (a === undefined ? undefined : codec.encode(a))
  );
}

export const documentReferenceCodec = new t.Type<
  DocumentReference,
  DocumentReference,
  unknown
>(
  'DocumentReference',
  (u: unknown): u is DocumentReference => u instanceof DocumentReference,
  (u, c) => (u instanceof DocumentReference ? t.success(u) : t.failure(u, c)),
  t.identity
);

export const timestampReferenceCodec = new t.Type<
  Date | null,
  Timestamp | null,
  unknown
>(
  'TimestampReference',
  (u: unknown): u is Date | null => u === null || u instanceof Date,
  (u, c) => {
    if (u === null) {
      return t.success(null);
    }
    if (u instanceof Timestamp) {
      return t.success(u.toDate());
    }
    return t.failure(u, c);
  },
  (a) => (a !== null ? Timestamp.fromDate(a) : null)
);

export const timestampReferenceWithServerDefaultCodec = withEncode(
  timestampReferenceCodec,
  (a) => (a === null ? serverTimestamp() : timestampReferenceCodec.encode(a)),
  'TimestampReferenceWithServerDefault'
);
