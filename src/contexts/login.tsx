import { User as AuthUser, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { fold } from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Loading } from '../components';
import { auth, db } from '../firebase';
import { User } from '../types';
import { userCodec } from '../types/user';

const LoginContext = React.createContext<[AuthUser | null, User | null]>([
  null,
  null,
]);
const { Provider: BaseProvider, Consumer: LoginConsumer } = LoginContext;

type LoginProviderProps = {
  children?: React.ReactNode;
};

const LoginProvider = ({
  children,
}: LoginProviderProps): React.ReactElement => {
  const navigate = useNavigate();

  const [authUser, setAuthUser] = useState<AuthUser | null | undefined>(
    auth.currentUser || undefined
  );
  const [user, setUser] = useState<User | null | undefined>(null);

  useEffect(() => {
    onAuthStateChanged(auth, setAuthUser);
  }, []);

  useEffect(() => {
    setUser(null);
    if (authUser == null) {
      return;
    }
    return onSnapshot(doc(db, 'users', authUser.uid), (doc) => {
      if (!doc.exists()) {
        setUser(undefined);
        return;
      }
      pipe(
        userCodec.decode(doc.data()),
        fold((errors) => {
          console.error(errors);
          throw new Error('decode error');
        }, setUser)
      );
    });
  }, [authUser]);

  useEffect(() => {
    if (authUser !== null && user === undefined) {
      navigate('/sign-up/create-user-info/');
    }
  }, [authUser, user, navigate]);

  return authUser === undefined ? (
    <Loading />
  ) : (
    <BaseProvider value={[authUser, user ?? null]}>{children}</BaseProvider>
  );
};

export { LoginContext, LoginProvider, LoginConsumer };
