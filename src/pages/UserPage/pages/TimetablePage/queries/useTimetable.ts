import { doc, getDoc } from 'firebase/firestore';
import { fold } from 'fp-ts/lib/Either';
import { identity, pipe } from 'fp-ts/lib/function';
import { useEffect, useState } from 'react';

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

  useEffect(() => {
    let isUnmounted = false;
    async function fetch(): Promise<void> {
      const snapshot = await getDoc(
        doc(db, 'users', userID, 'timetables', timetableID)
      );
      if (isUnmounted) {
        return;
      }
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
    setFetchState({ stage: 'loading' });
    fetch();
    return () => {
      isUnmounted = true;
    };
  }, [userID, timetableID]);

  return fetchState;
};
