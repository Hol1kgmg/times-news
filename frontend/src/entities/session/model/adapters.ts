import { brand } from "#/shared/lib/branded";

import type { GithubLogin, LoginAccessKey, SessionState } from "./types";

type RawSessionResponse = { authenticated: false } | { authenticated: true; login: string };

export const toSessionStatus = (raw: unknown): SessionState => {
  const rawResponse = raw as RawSessionResponse;
  return rawResponse.authenticated
    ? { authenticated: true, login: brand<GithubLogin>(rawResponse.login) }
    : { authenticated: false };
};

export const toLoginAccessKey = (raw: string): LoginAccessKey => brand<LoginAccessKey>(raw);
