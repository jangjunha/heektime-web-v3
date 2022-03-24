import { createContext } from 'react';

import { Semester, Timetable } from '../../../../types';

export const TimetableContext = createContext<{
  timetable: [string, Timetable];
  semester?: Semester;
}>(undefined as never);
