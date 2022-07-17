import { Either, left, right } from 'fp-ts/Either';

const ENDPOINT = 'https://auth.api.heektime.heek.kr/';

export type RegisterError =
  | {
      type: 'invalid';
    }
  | {
      type: 'email-already-exists';
    }
  | { type: 'unexpected' };

export type LoginError =
  | {
      type: 'invalid-credentials';
    }
  | { type: 'unexpected' };

export async function register(
  email: string,
  password: string
): Promise<Either<RegisterError, undefined>> {
  const url = new URL('/register/', ENDPOINT);
  const resp = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  if (!resp.ok) {
    if (resp.status === 400) {
      return left({ type: 'invalid' });
    } else if (resp.status === 409) {
      return left({ type: 'email-already-exists' });
    }
    return left({ type: 'unexpected' });
  }
  return right(undefined);
}

export async function login(
  email: string,
  password: string
): Promise<Either<LoginError, string>> {
  const url = new URL('/login/', ENDPOINT);
  const resp = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  if (!resp.ok) {
    if (resp.status === 400) {
      return left({ type: 'invalid-credentials' });
    }
    return left({ type: 'unexpected' });
  }
  let res;
  try {
    res = await resp.json();
  } catch {
    return left({ type: 'unexpected' });
  }
  return right(res.token);
}
