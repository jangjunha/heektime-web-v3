import { chain } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import * as t from 'io-ts';

const literalWeekdayCodec = t.keyof({
  monday: null,
  tuesday: null,
  wednesday: null,
  thursday: null,
  friday: null,
  saturday: null,
  sunday: null,
});
export type Weekday = t.TypeOf<typeof literalWeekdayCodec>;

const weekdayCodec = new t.Type<Weekday, number, unknown>(
  'Weekday',
  literalWeekdayCodec.is,
  (u, c) =>
    pipe(
      t.number.validate(u, c),
      chain((s) => {
        switch (s) {
          case 0:
            return t.success('monday');
          case 1:
            return t.success('tuesday');
          case 2:
            return t.success('wednesday');
          case 3:
            return t.success('thursday');
          case 4:
            return t.success('friday');
          case 5:
            return t.success('saturday');
          case 6:
            return t.success('sunday');
          default:
            return t.failure(u, c);
        }
      })
    ),
  (a) => {
    switch (a) {
      case 'monday':
        return 0;
      case 'tuesday':
        return 1;
      case 'wednesday':
        return 2;
      case 'thursday':
        return 3;
      case 'friday':
        return 4;
      case 'saturday':
        return 5;
      case 'sunday':
        return 6;
    }
  }
);

export { weekdayCodec };

export const allWeekdaysFromMonday: Weekday[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export const toShortName = (o: Weekday): string => {
  switch (o) {
    case 'monday':
      return 'MON';
    case 'tuesday':
      return 'TUE';
    case 'wednesday':
      return 'WED';
    case 'thursday':
      return 'THU';
    case 'friday':
      return 'FRI';
    case 'saturday':
      return 'SAT';
    case 'sunday':
      return 'SUN';
  }
};

export const toLocalizedShortName = (o: Weekday): string => {
  switch (o) {
    case 'monday':
      return '월';
    case 'tuesday':
      return '화';
    case 'wednesday':
      return '수';
    case 'thursday':
      return '목';
    case 'friday':
      return '금';
    case 'saturday':
      return '토';
    case 'sunday':
      return '일';
  }
};

export const toLuxonWeekday = (a: Weekday): luxon.WeekdayNumbers => {
  switch (a) {
    case 'monday':
      return 1;
    case 'tuesday':
      return 2;
    case 'wednesday':
      return 3;
    case 'thursday':
      return 4;
    case 'friday':
      return 5;
    case 'saturday':
      return 6;
    case 'sunday':
      return 7;
  }
};

export const fromLuxonWeekday = (o: luxon.WeekdayNumbers): Weekday => {
  switch (o) {
    case 1:
      return 'monday';
    case 2:
      return 'tuesday';
    case 3:
      return 'wednesday';
    case 4:
      return 'thursday';
    case 5:
      return 'friday';
    case 6:
      return 'saturday';
    case 7:
      return 'sunday';
  }
};

export const toRRuleWeekday = (
  a: Weekday
): 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU' => {
  switch (a) {
    case 'monday':
      return 'MO';
    case 'tuesday':
      return 'TU';
    case 'wednesday':
      return 'WE';
    case 'thursday':
      return 'TH';
    case 'friday':
      return 'FR';
    case 'saturday':
      return 'SA';
    case 'sunday':
      return 'SU';
  }
};
