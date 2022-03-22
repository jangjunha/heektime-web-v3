import * as t from 'io-ts';

const schoolCodec = t.type({
  name: t.string,
});

export { schoolCodec };
export type School = t.TypeOf<typeof schoolCodec>;
