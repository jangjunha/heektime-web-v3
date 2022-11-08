import * as Sentry from '@sentry/react';
import { User as AuthUser, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { fold } from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

import { Loading } from '../components';
import { auth, db } from '../firebase';
import { User } from '../types';
import { userCodec } from '../types/user';

type FirebaseAuthState = AuthUser | null;
type UserDocumentState =
  | { status: 'logged-out' }
  | { status: 'logging-in'; authUser: AuthUser }
  | { status: 'not-exists'; authUser: AuthUser }
  | { status: 'logged-in'; authUser: AuthUser; user: User };

type FetchState =
  | { stage: 'loading'; id: string | null }
  | { stage: 'fetched'; id: string; user: User | null };

// App 에서만 사용해야 하는 context
export const _FirebaseAuthContext =
  React.createContext<FirebaseAuthState>(null);
export const _UserDocumentContext = React.createContext<UserDocumentState>({
  status: 'logged-out',
});

// 공개 context
export const LoginContext = React.createContext<{
  uid: string;
  user: User;
} | null>(null);

export const _FirebaseAuthProvider = ({
  children,
}: {
  children?: React.ReactNode;
}): React.ReactElement => {
  const [authUser, setAuthUser] = useState<FirebaseAuthState>(auth.currentUser);

  useEffect(() => {
    onAuthStateChanged(auth, (authUser): void => {
      setAuthUser(authUser);
      window.dataLayer.push({ user_id: authUser?.uid ?? null });
      Sentry.addBreadcrumb({
        category: 'auth',
        message:
          authUser !== null
            ? `Authenticated user ${authUser.uid}`
            : 'User unauthenticated',
        level: 'info',
      });
    });
  }, []);

  return (
    // eslint-disable-next-line react/jsx-pascal-case
    <_FirebaseAuthContext.Provider value={authUser}>
      {children}
    </_FirebaseAuthContext.Provider>
  );
};

export const _UserDocumentProvider = ({
  children,
}: {
  children?: React.ReactNode;
}): React.ReactElement => {
  const authUser = useContext(_FirebaseAuthContext);

  const [state, setState] = useState<FetchState>({
    stage: 'loading',
    id: null,
  });

  const uid = authUser?.uid ?? null;
  useEffect(() => {
    setState({ stage: 'loading', id: uid });
    if (uid === null) {
      return;
    }
    return onSnapshot(doc(db, 'users', uid), (doc) => {
      if (!doc.exists()) {
        setState({ stage: 'fetched', id: uid, user: null });
        return;
      }
      pipe(
        userCodec.decode(doc.data()),
        fold(
          (errors) => {
            console.error(errors);
            throw new Error('decode error');
          },
          (user) => {
            setState({ stage: 'fetched', id: uid, user });
          }
        )
      );
    });
  }, [uid]);

  return (
    // eslint-disable-next-line react/jsx-pascal-case
    <_UserDocumentContext.Provider
      value={
        authUser === null
          ? { status: 'logged-out' }
          : state.stage === 'fetched' && state.id === uid
          ? state.user !== null
            ? { status: 'logged-in', authUser, user: state.user }
            : { status: 'not-exists', authUser }
          : { status: 'logging-in', authUser }
      }
    >
      {children}
    </_UserDocumentContext.Provider>
  );
};

export const LoginProvider = ({
  children,
}: {
  children?: React.ReactNode;
}): React.ReactElement => {
  const state = useContext(_UserDocumentContext);

  useEffect(() => {
    Sentry.setUser(
      state.status !== 'logged-out'
        ? {
            id: state.authUser.uid,
            username:
              state.status === 'logged-in' ? state.user?.username : undefined,
            email: state.authUser.email ?? undefined,
          }
        : null
    );
  }, [state]);

  if (state.status === 'logging-in') {
    return <Loading />;
  }
  if (state.status === 'not-exists') {
    return <Navigate to="/sign-up/create-user-info/" />;
  }
  return (
    <LoginContext.Provider
      value={
        state.status === 'logged-in'
          ? { uid: state.authUser.uid, user: state.user }
          : null
      }
    >
      {children}
    </LoginContext.Provider>
  );
};
