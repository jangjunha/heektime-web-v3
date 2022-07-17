import {
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { fold } from 'fp-ts/lib/Either';
import { identity, pipe } from 'fp-ts/lib/function';
import { useEffect, useMemo, useState } from 'react';

import { db } from '../../../../../firebase';
import { Timetable } from '../../../../../types';
import { timetableCodec } from '../../../../../types/timetable';

export type FetchState =
  | { stage: 'loading' }
  | { stage: 'fetched'; id: string; timetable: Timetable }
  | { stage: 'error'; message: string };

export const useTimetable = (
  userID: string,
  timetableID: string
): FetchState => {
  const [fetchState, setFetchState] = useState<FetchState>({
    stage: 'loading',
  });

  useEffect(
    () =>
      onSnapshot(
        doc(db, 'users', userID, 'timetables', timetableID),
        (snapshot) => {
          if (!snapshot.exists()) {
            setFetchState({
              stage: 'error',
              message: '시간표를 찾을 수 없습니다.',
            });
            return;
          }

          const data = pipe(
            timetableCodec.decode(snapshot.data()),
            fold((errors) => {
              console.error(errors);
              throw new Error('decode error');
            }, identity)
          );
          if (data == null) {
            setFetchState({
              stage: 'error',
              message: '시간표 정보를 처리하는 중 오류가 발생했습니다.',
            });
            throw new Error('Cannot decode timetable');
          }

          setFetchState({ stage: 'fetched', id: snapshot.id, timetable: data });
        }
      ),
    [userID, timetableID]
  );

  return fetchState;
};

export const useEditTimetable = (
  userID: string,
  timetableID: string
): {
  changeVisibility(visibility: 'public' | 'private'): Promise<void>;
  delete_(): Promise<void>;
} => {
  return useMemo(() => {
    const ref = doc(db, 'users', userID, 'timetables', timetableID);
    return {
      async changeVisibility(visibility: 'public' | 'private'): Promise<void> {
        await updateDoc(ref, { visibility, updatedAt: serverTimestamp() });
      },
      async delete_(): Promise<void> {
        await deleteDoc(ref);
      },
    };
  }, [userID, timetableID]);
};
