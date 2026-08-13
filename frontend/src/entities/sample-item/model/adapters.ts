import { brand } from "#/shared/lib/branded";

import type { SampleItem, SampleItemId, SampleItemListEntry, SampleItemName } from "./types";

type RawSampleItem = {
  id: number;
  name: string;
};

type RawSampleItemListEntry = {
  id: number;
  name: string;
  nameJa: string;
};

export const toSampleItem = (raw: RawSampleItem): SampleItem => ({
  id: brand<SampleItemId>(raw.id),
  name: brand<SampleItemName>(raw.name),
});

export const toSampleItemList = (raw: unknown): SampleItemListEntry[] =>
  (raw as RawSampleItemListEntry[]).map((item) => ({
    id: brand<SampleItemId>(item.id),
    name: brand<SampleItemName>(item.name),
    nameJa: brand<SampleItemName>(item.nameJa),
  }));
