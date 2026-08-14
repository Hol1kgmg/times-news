import type { NewsItem } from "#/entities/news-item";
import type { ArchiveDate } from "#/entities/archive-date";

import type { Archive } from "./types";

export const toArchive = (date: ArchiveDate, items: NewsItem[]): Archive => ({
  date,
  items,
});
