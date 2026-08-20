import type { Branded } from "#/shared/lib/branded";

export type GithubLogin = Branded<string, "GithubLogin">;

export type SessionState = { authenticated: false } | { authenticated: true; login: GithubLogin };
