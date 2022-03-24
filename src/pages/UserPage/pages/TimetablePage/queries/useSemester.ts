import { doc, getDoc } from 'firebase/firestore';
import { fold } from 'fp-ts/lib/Either';
import { identity, pipe } from 'fp-ts/lib/function';
import { useEffect, useState } from 'react';

import { db } from '../../../../../firebase';
import { Semester } from '../../../../../types';
import { semesterCodec } from '../../../../../types/semester';

export type SemesterFetchState =
  | { stage: 'loading' }
  | { stage: 'fetched'; semester: Semester }
  | { stage: 'error'; message: string };

export const useSemester = (path: string | undefined): SemesterFetchState => {
  const [fetchState, setFetchState] = useState<SemesterFetchState>({
    stage: 'loading',
  });

  useEffect(() => {
    let isUnmounted = false;
    async function fetch(): Promise<void> {
      if (path === undefined) {
        return;
      }

      const snapshot = await getDoc(doc(db, path));
      if (isUnmounted) {
        return;
      }
      if (!snapshot.exists()) {
        setFetchState({
          stage: 'error',
          message: '학기를 찾을 수 없습니다.',
        });
        return;
      }

      const data = pipe(
        semesterCodec.decode(snapshot.data()),
        fold((errors) => {
          console.error(errors);
          throw new Error('decode error');
        }, identity)
      );
      if (data == null) {
        setFetchState({
          stage: 'error',
          message: '학기 정보를 처리하는 중 오류가 발생했습니다.',
        });
        throw new Error('Cannot decode semester');
      }

      setFetchState({ stage: 'fetched', semester: data });
    }
    setFetchState({ stage: 'loading' });
    fetch();
    return () => {
      isUnmounted = true;
    };
  }, [path]);

  return fetchState;
};
