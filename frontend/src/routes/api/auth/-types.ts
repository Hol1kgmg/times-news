import type { Branded } from "#/shared/lib/branded";

export type SessionSecret = Branded<string, "SessionSecret">;
export type GithubLogin = Branded<string, "GithubLogin">;

export type SessionPayload = {
  login: GithubLogin;
  iat: number;
};

export const isSessionPayload = (value: unknown): value is SessionPayload =>
  typeof value === "object" &&
  value !== null &&
  "login" in value &&
  "iat" in value &&
  typeof value.login === "string" &&
  typeof value.iat === "number";

export type RawGithubTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

export type RawGithubUserResponse = {
  login: string;
  id: number;
};
