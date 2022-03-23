const ZERO_WIDTH_JOINER = '\u{200D}';
const VARIATION_SELECTOR = '\u{FE0F}';
const GENDERS = ['\u{2640}', '\u{2642}'];
const SKINTONES = [
  '\u{1F3FB}',
  '\u{1F3FC}',
  '\u{1F3FD}',
  '\u{1F3FE}',
  '\u{1F3FF}',
];

const randomItem = <T extends unknown | undefined>(items: T[]): T => {
  return items[crypto.getRandomValues(new Uint32Array(1))[0] % items.length];
};

export const variate = (emoji: string, includesNone = true): string => {
  const skintone = randomItem([
    ...SKINTONES,
    ...(includesNone ? [undefined] : []),
  ]);
  const gender = randomItem([...GENDERS, ...(includesNone ? [undefined] : [])]);
  if (skintone == null && gender == null) {
    return emoji;
  }
  let res = emoji;
  if (skintone != null) {
    res += skintone;
  }
  if (gender != null) {
    res += ZERO_WIDTH_JOINER + gender;
  }
  res += VARIATION_SELECTOR;
  return res;
};
