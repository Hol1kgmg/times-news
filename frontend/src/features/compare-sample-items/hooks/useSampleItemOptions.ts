"use client";

import { useAtomValue } from "jotai";

import { useSampleItemList } from "#/entities/sample-item";
import type { SampleItemId, SampleItemListEntry, SampleItemName } from "#/entities/sample-item";
import { isJaAtom } from "#/shared/state/langAtom";

export type SampleItemOption = { value: SampleItemId; label: string };

const toLabel = (id: SampleItemId, name: SampleItemName): string =>
  `${String(id).padStart(2, "0")} - ${name}`;

const toOption = (item: SampleItemListEntry, isJa: boolean): SampleItemOption => ({
  value: item.id,
  label: toLabel(item.id, isJa ? item.nameJa : item.name),
});

export const useSampleItemOptions = () => {
  const isJa = useAtomValue(isJaAtom);
  const { sampleItemList, loading, error } = useSampleItemList();

  const options = sampleItemList.map((item) => toOption(item, isJa));

  return { options, loading, error };
};
