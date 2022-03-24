import { doc, getDoc } from 'firebase/firestore';
import { fold } from 'fp-ts/lib/Either';
import { identity, pipe } from 'fp-ts/lib/function';
import { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';

import { Loading } from '../../../../components';
import { db } from '../../../../firebase';
import { Semester, Timetable } from '../../../../types';
import { semesterCodec } from '../../../../types/semester';
import { timetableCodec } from '../../../../types/timetable';
import Layout, { styles as layoutStyles } from '../../components/Layout';
import { UserContext } from '../../contexts';
import { TimetableContext } from './contexts';

type FetchState =
  | { stage: 'loading' }
  | { stage: 'fetched'; id: string; timetable: Timetable }
  | { stage: 'error'; message: string };

type SemesterFetchState =
  | { stage: 'loading' }
  | { stage: 'fetched'; semester: Semester }
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

const useSemester = (path: string | undefined): SemesterFetchState => {
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

const TimetablePage = (): React.ReactElement => {
  const { id } = useParams();
  if (id === undefined) {
    throw new Error('Cannot retrieve timetable id');
  }
  const location = useLocation();
  const [userID] = useContext(UserContext);

  const fetchState = useTimetable(userID, id);
  const semesterFetchState = useSemester(
    fetchState.stage === 'fetched'
      ? fetchState.timetable.semester.path
      : undefined
  );

  switch (fetchState.stage) {
    case 'loading':
      return <Loading />;
    case 'fetched': {
      const semester =
        semesterFetchState.stage === 'fetched'
          ? semesterFetchState.semester
          : undefined;
      return (
        <TimetableContext.Provider
          value={{
            timetable: [fetchState.id, fetchState.timetable],
            semester,
          }}
        >
          <Layout
            menu={
              <div className={layoutStyles.breadcrumb}>
                <Link to={location.pathname}>
                  {fetchState.timetable.title || '시간표'}
                  &nbsp;&nbsp;
                  {semester && (
                    <span className={layoutStyles.badge}>
                      {semester.year}년 {semester.term}
                    </span>
                  )}
                </Link>
              </div>
            }
          >
            제목: {fetchState.timetable.title}
          </Layout>
        </TimetableContext.Provider>
      );
    }
    case 'error':
      return <div>{fetchState.message}</div>;
  }
};

export { TimetableContext };
export default TimetablePage;
