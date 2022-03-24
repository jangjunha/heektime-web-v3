import {
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  Query,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from 'firebase/firestore';
import { fold } from 'fp-ts/lib/Either';
import { identity, pipe } from 'fp-ts/lib/function';
import { produce } from 'immer';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { Loading } from '../../../../components';
import { LoginContext } from '../../../../contexts/login';
import { db } from '../../../../firebase';
import { School, Semester, Timetable } from '../../../../types';
import { schoolCodec } from '../../../../types/school';
import { semesterCodec } from '../../../../types/semester';
import { timetableCodec } from '../../../../types/timetable';
import Layout from '../../components/Layout';
import { UserContext } from '../../contexts';

type SchoolFetchState =
  | { stage: 'requested' }
  | { stage: 'fetched'; school: School }
  | { stage: 'error'; message: string };

type SemesterFetchState =
  | { stage: 'requested' }
  | { stage: 'fetched'; semester: Semester }
  | { stage: 'error'; message: string };

type FetchState =
  | { stage: 'initial' }
  | {
      stage: 'paging';
      timetables: [string, Timetable][];
      lastSnapshot?: DocumentSnapshot;
    }
  | {
      stage: 'finish';
      timetables: [string, Timetable][];
      lastSnapshot?: DocumentSnapshot;
    }
  | { stage: 'error'; message: string };

type SemesterState = {
  path: string;
  school?: School;
  semester?: Semester;
  timetables: [string, Timetable][];
};

type GroupedFetchState =
  | { stage: 'initial' }
  | {
      stage: 'paging';
      semesters: SemesterState[];
    }
  | {
      stage: 'finish';
      semesters: SemesterState[];
    }
  | { stage: 'error'; message: string };

const FETCH_LIMIT = 20;

const buildPageQuery = (
  userID: string,
  isLoggedInUser: boolean,
  currentState: FetchState
): Query<DocumentData> => {
  const timetablesRef = collection(db, 'users', userID, 'timetables');
  let q = query(
    timetablesRef,
    orderBy('semester', 'desc'),
    orderBy('createdAt', 'desc'),
    limit(FETCH_LIMIT)
  );
  if (!isLoggedInUser) {
    q = query(q, where('visibility', '==', 'public'));
  }
  if (currentState.stage === 'paging') {
    q = query(q, startAfter(currentState.lastSnapshot));
  }
  return q;
};

const useTimetables = (
  userID: string,
  isLoggedInUser: boolean
): [boolean, FetchState, () => Promise<void>] => {
  const [isLoading, setLoading] = useState(true);
  const [fetchState, setFetchState] = useState<FetchState>({
    stage: 'initial',
  });

  const fetchNext = useCallback(async (): Promise<void> => {
    setLoading(true);

    const q = buildPageQuery(userID, isLoggedInUser, fetchState);
    const querySnapshot = await getDocs(q);
    if (querySnapshot.docs.length === 0) {
      setFetchState((prev) => {
        switch (prev.stage) {
          case 'initial':
          case 'error':
            return { stage: 'finish', timetables: [] };
          case 'paging':
          case 'finish':
            return { stage: 'finish', timetables: prev.timetables };
        }
      });
      setLoading(false);
      return;
    }

    const lastSnapshot = querySnapshot.docs[querySnapshot.docs.length - 1];
    const timetables = querySnapshot.docs.flatMap(
      (snapshot): [string, Timetable][] => {
        const decoded = pipe(
          timetableCodec.decode(snapshot.data()),
          fold((errors) => {
            console.error(errors);
            throw new Error('decode error');
          }, identity)
        );
        if (decoded == null) {
          return [];
        }
        return [[snapshot.id, decoded]];
      }
    );
    setFetchState((prev) => {
      switch (prev.stage) {
        case 'initial':
        case 'error':
          return { stage: 'paging', timetables: timetables, lastSnapshot };
        case 'paging':
        case 'finish':
          return produce(prev, (draft) => {
            draft.timetables.push(...timetables);
            draft.lastSnapshot = lastSnapshot;
          });
      }
    });
    setLoading(false);
  }, [userID, isLoggedInUser, fetchState]);

  useEffect(() => {
    setFetchState({ stage: 'initial' });
  }, [userID, isLoggedInUser]);

  useEffect(() => {
    if (fetchState.stage === 'initial') {
      fetchNext();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchState.stage]);

  return [isLoading, fetchState, fetchNext];
};

const useSchools = (): [
  { [id: string]: SchoolFetchState },
  (id: string) => Promise<void>
] => {
  const [schools, setSchools] = useState<{ [id: string]: SchoolFetchState }>(
    {}
  );
  const request = async (id: string): Promise<void> => {
    const prev = schools[id];
    if (prev != null) {
      // already requested
      return;
    }
    setSchools({ ...schools, [id]: { stage: 'requested' } });

    const snapshot = await getDoc(doc(db, 'schools', id));
    if (!snapshot.exists()) {
      setSchools({
        ...schools,
        [id]: { stage: 'error', message: '학교를 찾을 수 없습니다.' },
      });
      return;
    }

    const school = pipe(
      schoolCodec.decode(snapshot.data()),
      fold((errors) => {
        console.error(errors);
        throw new Error('decode error');
      }, identity)
    );
    if (school == null) {
      setSchools({
        ...schools,
        [id]: { stage: 'error', message: '학교를 찾을 수 없습니다.' },
      });
      throw new Error('Cannot decode school');
    }

    setSchools({ ...schools, [id]: { stage: 'fetched', school } });
  };
  return [schools, request];
};

const useSemesters = (): [
  { [path: string]: SemesterFetchState },
  (path: string) => Promise<void>
] => {
  const [semesters, setSemesters] = useState<{
    [path: string]: SemesterFetchState;
  }>({});
  const request = async (path: string): Promise<void> => {
    const prev = semesters[path];
    if (prev != null) {
      // already requested
      return;
    }
    setSemesters({ ...semesters, [path]: { stage: 'requested' } });

    const snapshot = await getDoc(doc(db, path));
    if (!snapshot.exists()) {
      setSemesters({
        ...semesters,
        [path]: { stage: 'error', message: '학기를 찾을 수 없습니다.' },
      });
      return;
    }

    const semester = pipe(
      semesterCodec.decode(snapshot.data()),
      fold((errors) => {
        console.error(errors);
        throw new Error('decode error');
      }, identity)
    );
    if (semester == null) {
      setSemesters({
        ...semesters,
        [path]: { stage: 'error', message: '학기를 찾을 수 없습니다.' },
      });
      throw new Error('Cannot decode semester');
    }

    setSemesters({ ...semesters, [path]: { stage: 'fetched', semester } });
  };
  return [semesters, request];
};

const useGroupedTimetables = (
  userID: string,
  isLoggedInUser: boolean
): [boolean, GroupedFetchState, () => Promise<void>] => {
  const [isLoading, fetchState, loadNext] = useTimetables(
    userID,
    isLoggedInUser
  );

  const [schools, requestSchool] = useSchools();
  const [semesters, requestSemester] = useSemesters();
  useEffect(() => {
    switch (fetchState.stage) {
      case 'initial':
      case 'error':
        return;
      case 'paging':
      case 'finish':
        for (const [, timetable] of fetchState.timetables) {
          const schoolRef = timetable.semester.parent.parent;
          if (schoolRef != null) {
            requestSchool(schoolRef.id);
          }
          requestSemester(timetable.semester.path);
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchState]);

  return useMemo(() => {
    switch (fetchState.stage) {
      case 'initial':
      case 'error':
        return [isLoading, fetchState, loadNext];
      case 'paging':
      case 'finish': {
        const group = new Map<
          string,
          { ref: DocumentReference; timetables: [string, Timetable][] }
        >();
        for (const elem of fetchState.timetables) {
          const [, timetable] = elem;
          const key = timetable.semester.path;
          const prev = group.get(key)?.timetables ?? [];
          group.set(key, {
            ref: timetable.semester,
            timetables: [...prev, elem],
          });
        }
        const groupedSemesters: SemesterState[] = Array.from(
          group,
          ([, { ref, timetables }]) => {
            const schoolRef = ref.parent.parent;
            const schoolState: SchoolFetchState | undefined =
              schoolRef != null ? schools[schoolRef.id] : undefined;
            const semesterState: SemesterFetchState | undefined =
              semesters[ref.path];
            return {
              path: ref.path,
              school:
                schoolState?.stage === 'fetched'
                  ? schoolState.school
                  : undefined,
              semester:
                semesterState?.stage === 'fetched'
                  ? semesterState.semester
                  : undefined,
              timetables,
            };
          }
        );
        return [
          isLoading,
          { stage: fetchState.stage, semesters: groupedSemesters },
          loadNext,
        ];
      }
    }
  }, [isLoading, fetchState, loadNext, schools, semesters]);
};

const IndexPageContent = (): React.ReactElement => {
  const [id] = useContext(UserContext);
  const [authUser] = useContext(LoginContext);

  const [isLoading, groupedState, loadNext] = useGroupedTimetables(
    id,
    id === authUser?.uid
  );

  switch (groupedState.stage) {
    case 'initial':
      return <Loading />;
    case 'error':
      return <div>{groupedState.message}</div>;
    case 'paging':
    case 'finish':
      return (
        <>
          <Link to="create-timetable/">새 시간표 만들기</Link>
          <ul>
            {groupedState.semesters.map((group) => (
              <li key={group.path}>
                <p>
                  {group.school != null && group.school.name}{' '}
                  {group.semester != null &&
                    `${group.semester.year}년 ${group.semester.term}`}
                </p>
                <ul>
                  {group.timetables.map(([id, timetable]) => (
                    <li key={id}>
                      <Link to={`timetable/${id}`}>
                        {timetable.title || '이름 없는 시간표'}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          {groupedState.stage === 'paging' && !isLoading && (
            <button onClick={loadNext}>더 불러오기</button>
          )}
        </>
      );
  }
};

const IndexPage = (): React.ReactElement => (
  <Layout>
    <IndexPageContent />
  </Layout>
);

export default IndexPage;
