"use client";

import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

import { resolveApiUrl } from "#/shared/lib/apiUrl";

import { toSessionStatus } from "./model/adapters";
import { sessionKeys } from "./model/queryKeys";
import type { SessionState } from "./model/types";

const resolveRequestCookieHeader = createIsomorphicFn()
  .client((): string | undefined => undefined)
  .server((): string | undefined => getRequestHeader("Cookie"));

const fetchSessionStatus = async (): Promise<SessionState> => {
  const cookieHeader = resolveRequestCookieHeader();
  const res = await fetch(resolveApiUrl("/api/auth/session"), {
    headers: cookieHeader === undefined ? undefined : { Cookie: cookieHeader },
  });
  if (!res.ok) throw new Error(`BFF error: ${res.status}`);
  return toSessionStatus(await res.json());
};

export const sessionStatusQueryOptions = () =>
  queryOptions({ queryKey: sessionKeys.status(), queryFn: fetchSessionStatus });

export const useSessionStatus = () => useSuspenseQuery(sessionStatusQueryOptions());
