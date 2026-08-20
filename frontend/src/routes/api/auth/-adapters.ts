import { brand } from "#/shared/lib/branded";

import type { GithubLogin, RawGithubTokenResponse, RawGithubUserResponse, SessionSecret } from "./-types";

export const toSessionSecret = (raw: string): SessionSecret => brand<SessionSecret>(raw);

export const toGithubLogin = (raw: string): GithubLogin => brand<GithubLogin>(raw);

export const toRawGithubTokenResponse = (raw: unknown): RawGithubTokenResponse =>
  raw as RawGithubTokenResponse;

export const toRawGithubUserResponse = (raw: unknown): RawGithubUserResponse =>
  raw as RawGithubUserResponse;
