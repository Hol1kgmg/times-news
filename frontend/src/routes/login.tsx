import { createFileRoute } from "@tanstack/react-router";

import type { LoginAccessKey, LoginErrorReason } from "#/entities/session";
import { toLoginAccessKey } from "#/entities/session";
import { LoginPage } from "#/pages/Login";

import { requireLoginAccessKey } from "./-login-guard";

const LOGIN_ERROR_REASONS: readonly LoginErrorReason[] = ["not_allowed"];

type LoginSearch = { key?: LoginAccessKey; error?: LoginErrorReason };

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    key: typeof search.key === "string" ? toLoginAccessKey(search.key) : undefined,
    error: LOGIN_ERROR_REASONS.find((reason) => reason === search.error),
  }),
  beforeLoad: async ({ search }) => {
    await requireLoginAccessKey(search.key);
  },
  component: () => {
    const { key, error } = Route.useSearch();
    return <LoginPage loginAccessKey={key} error={error} />;
  },
});
