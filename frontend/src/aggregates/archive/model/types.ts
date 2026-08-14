import type { NewsItem } from "#/entities/news-item";
import type { ArchiveDate } from "#/entities/archive-date";

export type Archive = {
  date: ArchiveDate;
  items: NewsItem[];
};
