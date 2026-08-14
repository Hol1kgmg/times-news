import type { ArchiveDate } from "#/entities/archive-date";

export const archiveKeys = {
  all: ["archive"] as const,
  detail: (date: ArchiveDate) => [...archiveKeys.all, "detail", date] as const,
};
