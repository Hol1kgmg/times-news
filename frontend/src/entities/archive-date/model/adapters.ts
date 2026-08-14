import { brand } from "#/shared/lib/branded";

import type { ArchiveDate } from "./types";

export const toArchiveDate = (raw: string): ArchiveDate => brand<ArchiveDate>(raw);

export const toArchiveDates = (raws: string[]): ArchiveDate[] => raws.map(toArchiveDate);
