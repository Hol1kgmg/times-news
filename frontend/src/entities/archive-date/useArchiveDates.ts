"use client";

import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { resolveApiUrl } from "#/shared/lib/apiUrl";

import { toArchiveDates } from "./model/adapters";
import { archiveDateKeys } from "./model/queryKeys";
import type { ArchiveDate } from "./model/types";

const fetchArchiveDates = async (): Promise<ArchiveDate[]> => {
  const res = await fetch(resolveApiUrl("/api/archive/dates"));
  if (!res.ok) throw new Error(`BFF error: ${res.status}`);
  const raws = (await res.json()) as string[];
  return toArchiveDates(raws);
};

export const archiveDatesQueryOptions = () =>
  queryOptions({
    queryKey: archiveDateKeys.list(),
    queryFn: fetchArchiveDates,
  });

export const useArchiveDates = () => useSuspenseQuery(archiveDatesQueryOptions());
