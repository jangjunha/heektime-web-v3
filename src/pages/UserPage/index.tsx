import { collection, getDocs, query, where } from 'firebase/firestore';
import { fold } from 'fp-ts/lib/Either';
import { identity, pipe } from 'fp-ts/lib/function';
import React, { useEffect, useState } from 'react';
import { Outlet, Route, useParams, useResolvedPath } from 'react-router-dom';

import { SentryRoutes } from '../..';
import { Loading } from '../../components';
import { db } from '../../firebase';
import { User, userCodec } from '../../types/user';
import { UserContext } from './contexts';
import CreateTimetablePage from './pages/CreateTimetablePage';
import IndexPage from './pages/IndexPage';
import TimetablePage from './pages/TimetablePage';

const Wrapper = ({ basePath }: { basePath: string }): React.ReactElement => (
  <Outlet context={basePath} />
);

type FetchState =
  | { stage: 'loading' }
  | { stage: 'fetched'; id: string; user: User }
  | { stage: 'error'; message: string };

const useUser = (username: string): FetchState => {
  const [fetchState, setFetchState] = useState<FetchState>({
    stage: 'loading',
  });

  useEffect(() => {
    let isUnmounted = false;
    async function fetchUser(): Promise<void> {
      const q = query(
        collection(db, 'users'),
        where('username', '==', username)
      );
      const querySnapshot = await getDocs(q);
      if (isUnmounted) {
        return;
      }
      if (querySnapshot.docs.length < 1) {
        setFetchState({
          stage: 'error',
          message: '사용자를 찾을 수 없습니다.',
        });
        return;
      }

      const doc = querySnapshot.docs[0];
      const data = pipe(
        userCodec.decode(doc.data()),
        fold((errors) => {
          console.error(errors);
          throw new Error('decode error');
        }, identity)
      );
      if (data == null) {
        setFetchState({
          stage: 'error',
          message: '사용자 정보를 처리하는 중 오류가 발생했습니다.',
        });
        throw new Error('Cannot decode user');
      }

      setFetchState({ stage: 'fetched', id: doc.id, user: data });
    }
    setFetchState({ stage: 'loading' });
    fetchUser();
    return () => {
      isUnmounted = true;
    };
  }, [username]);

  return fetchState;
};

const UserPage = (): React.ReactElement => {
  const { username } = useParams();
  if (username === undefined) {
    throw new Error('Cannot retrieve username');
  }
  const basePath = useResolvedPath('');

  const fetchState = useUser(username);

  switch (fetchState.stage) {
    case 'loading':
      return <Loading />;
    case 'fetched':
      return (
        <UserContext.Provider value={[fetchState.id, fetchState.user]}>
          <SentryRoutes>
            <Route path="/" element={<Wrapper basePath={basePath.pathname} />}>
              <Route index element={<IndexPage />} />
              <Route
                path="create-timetable/"
                element={<CreateTimetablePage />}
              />
              <Route path="timetable/:id/" element={<TimetablePage />} />
            </Route>
          </SentryRoutes>
        </UserContext.Provider>
      );
    case 'error':
      return <div>{fetchState.message}</div>;
  }
};

export { UserContext };
export default UserPage;
