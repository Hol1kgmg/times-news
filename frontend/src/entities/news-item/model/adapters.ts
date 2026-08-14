import { brand } from "#/shared/lib/branded";

import { CATEGORIES } from "./types";
import type { Category, EntryDate, NewsItem, RawNewsItem, Url } from "./types";

const isValidUrl = (value: string): boolean => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const isValidCategory = (value: string): boolean =>
  (CATEGORIES as readonly string[]).includes(value);

export const toNewsItem = (raw: RawNewsItem): NewsItem | undefined => {
  if (!isValidUrl(raw.url)) return undefined;
  if (!isValidCategory(raw.category)) return undefined;

  return {
    category: brand<Category>(raw.category),
    title: raw.title,
    url: brand<Url>(raw.url),
    entryDate: brand<EntryDate>(raw.entry_date),
  };
};

export const toNewsItems = (raws: RawNewsItem[]): NewsItem[] =>
  raws
    .map(toNewsItem)
    .filter((item): item is NewsItem => item !== undefined);
