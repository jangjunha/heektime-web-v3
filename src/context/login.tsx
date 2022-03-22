import { User as AuthUser, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { fold } from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import React, { useEffect, useState } from 'react';

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
  const [authUser, setAuthUser] = useState<AuthUser | null>(auth.currentUser);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    onAuthStateChanged(auth, setAuthUser);
  }, []);

  useEffect(() => {
    if (authUser == null) {
      return;
    }
    return onSnapshot(doc(db, 'users', authUser.uid), (doc) => {
      pipe(
        userCodec.decode(doc.data()),
        fold((errors) => {
          throw new Error('Cannot decode user');
        }, setUser)
      );
    });
  }, [authUser]);

  return <BaseProvider value={[authUser, user]}>{children}</BaseProvider>;
};

export { LoginContext, LoginProvider, LoginConsumer };
