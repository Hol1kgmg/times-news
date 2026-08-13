"use client";

import { useQuery } from "@tanstack/react-query";

import { toSampleItemList } from "./model/adapters";
import { sampleItemKeys } from "./model/queryKeys";
import type { SampleItemListEntry } from "./model/types";

const fetchSampleItemList = async (): Promise<SampleItemListEntry[]> => {
  const res = await fetch("/api/sample/items");
  if (!res.ok) throw new Error(`sample-item list error: ${res.status}`);
  return toSampleItemList(await res.json());
};

export const useSampleItemList = () => {
  const { data, isPending, isError } = useQuery({
    queryKey: sampleItemKeys.list(),
    queryFn: fetchSampleItemList,
  });

  return {
    sampleItemList: data ?? [],
    loading: isPending,
    error: isError ? "サンプルアイテム一覧の取得に失敗しました。" : null,
  };
};
