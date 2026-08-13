import type { Branded } from "#/shared/lib/branded";

export type SampleItemId = Branded<number, "SampleItemId">;
export type SampleItemName = Branded<string, "SampleItemName">;

export type SampleItem = {
  id: SampleItemId;
  name: SampleItemName;
};

export type SampleItemListEntry = {
  id: SampleItemId;
  name: SampleItemName;
  nameJa: SampleItemName;
};
