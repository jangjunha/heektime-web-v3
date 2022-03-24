import { doc, getDoc } from 'firebase/firestore';
import { fold } from 'fp-ts/lib/Either';
import { identity, pipe } from 'fp-ts/lib/function';
import { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';

import { Loading } from '../../../../components';
import { db } from '../../../../firebase';
import { Timetable } from '../../../../types';
import { timetableCodec } from '../../../../types/timetable';
import Layout from '../../components/Layout';
import { UserContext } from '../../contexts';
import { TimetableContext } from './contexts';

type FetchState =
  | { stage: 'loading' }
  | { stage: 'fetched'; id: string; timetable: Timetable }
  | { stage: 'error'; message: string };

const useTimetable = (userID: string, timetableID: string): FetchState => {
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

const TimetablePage = (): React.ReactElement => {
  const { id } = useParams();
  if (id === undefined) {
    throw new Error('Cannot retrieve timetable id');
  }
  const [userID] = useContext(UserContext);

  const location = useLocation();
  const fetchState = useTimetable(userID, id);

  switch (fetchState.stage) {
    case 'loading':
      return <Loading />;
    case 'fetched':
      return (
        <TimetableContext.Provider
          value={[fetchState.id, fetchState.timetable]}
        >
          <Layout
            menu={
              <Link to={location.pathname}>
                {fetchState.timetable.title || '시간표'}
              </Link>
            }
          >
            제목: {fetchState.timetable.title}
          </Layout>
        </TimetableContext.Provider>
      );
    case 'error':
      return <div>{fetchState.message}</div>;
  }
};

export { TimetableContext };
export default TimetablePage;
