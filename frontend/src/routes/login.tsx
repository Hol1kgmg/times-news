import { createFileRoute } from "@tanstack/react-router";

import { LoginPage } from "#/pages/Login";

import { requireLoginAccessKey } from "./-login-guard";

type LoginSearch = { key?: string };

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    key: typeof search.key === "string" ? search.key : undefined,
  }),
  beforeLoad: async ({ search }) => {
    await requireLoginAccessKey(search.key);
  },
  component: LoginPage,
});
