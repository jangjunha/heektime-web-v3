import { DocumentReference, Timestamp } from 'firebase/firestore';
import * as t from 'io-ts';

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

export const DocumentReferenceCodec = new t.Type<
  DocumentReference,
  DocumentReference,
  unknown
>(
  'DocumentReference',
  (u: unknown): u is DocumentReference => u instanceof DocumentReference,
  (u, c) => (u instanceof DocumentReference ? t.success(u) : t.failure(u, c)),
  t.identity
);

export const TimestampReferenceCodec = new t.Type<Date, Timestamp, unknown>(
  'TimestampReference',
  (u: unknown): u is Date => u instanceof Date,
  (u, c) => (u instanceof Timestamp ? t.success(u.toDate()) : t.failure(u, c)),
  Timestamp.fromDate
);
