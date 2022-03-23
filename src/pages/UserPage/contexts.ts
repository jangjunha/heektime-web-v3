import { createContext } from 'react';

import { User } from '../../types';

export const UserContext = createContext<[string, User]>(undefined as never);
