"use client";

import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { toNewsItems } from "#/entities/news-item";
import type { NewsItem, RawNewsItem } from "#/entities/news-item";
import type { ArchiveDate } from "#/entities/archive-date";
import { resolveApiUrl } from "#/shared/lib/apiUrl";

import { toArchive } from "./model/adapters";
import { archiveKeys } from "./model/queryKeys";
import type { Archive } from "./model/types";

const fetchArchiveItems = async (date: ArchiveDate): Promise<NewsItem[]> => {
  const res = await fetch(resolveApiUrl(`/api/archive/items?date=${encodeURIComponent(date)}`));
  if (!res.ok) throw new Error(`BFF error: ${res.status}`);
  const raws = (await res.json()) as RawNewsItem[];
  return toNewsItems(raws);
};

export const archiveQueryOptions = (date: ArchiveDate) =>
  queryOptions({
    queryKey: archiveKeys.detail(date),
    queryFn: async (): Promise<Archive> => toArchive(date, await fetchArchiveItems(date)),
  });

export const useArchive = (date: ArchiveDate) => useSuspenseQuery(archiveQueryOptions(date));
