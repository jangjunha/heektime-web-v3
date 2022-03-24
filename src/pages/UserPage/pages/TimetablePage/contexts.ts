import { createContext } from 'react';

import { Semester, Timetable, UserLecture } from '../../../../types';

export const TimetableContext = createContext<{
  timetable: [string, Timetable];
  lectures?: [string, UserLecture][];
  semester?: Semester;
}>(undefined as never);
