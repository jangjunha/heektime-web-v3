import { collection, onSnapshot } from 'firebase/firestore';
import { fold } from 'fp-ts/lib/Either';
import { identity, pipe } from 'fp-ts/lib/function';
import { useEffect, useState } from 'react';

import { db } from '../../../../../firebase';
import { UserLecture } from '../../../../../types';
import { userLectureCodec } from '../../../../../types/lecture';

export type LecturesFetchState =
  | { stage: 'loading' }
  | { stage: 'fetched'; lectures: [string, UserLecture][] }
  | { stage: 'error'; message: string };

export const useLectures = (
  userID: string,
  timetableID: string
): LecturesFetchState => {
  const [fetchState, setFetchState] = useState<LecturesFetchState>({
    stage: 'loading',
  });

  useEffect(() => {
    setFetchState({ stage: 'loading' });

    const unsubscribe = onSnapshot(
      collection(db, 'users', userID, 'timetables', timetableID, 'lectures'),
      (querySnapshot) => {
        const lectures = querySnapshot.docs.flatMap(
          (snapshot): [string, UserLecture][] => {
            const data = pipe(
              userLectureCodec.decode(snapshot.data()),
              fold((errors) => {
                // TODO: report error
                console.error(errors);
                return null;
              }, identity)
            );
            if (data == null) {
              return [];
            }
            return [[snapshot.id, data]];
          }
        );
        setFetchState({ stage: 'fetched', lectures });
      }
    );
    return unsubscribe;
  }, [userID, timetableID]);

  return fetchState;
};
