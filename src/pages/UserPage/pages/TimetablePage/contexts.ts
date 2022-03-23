import { createContext } from 'react';

import { Timetable } from '../../../../types';

export const TimetableContext = createContext<[string, Timetable]>(
  undefined as never
);
