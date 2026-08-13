import type { SampleItemId, SampleItemName } from "#/entities/sample-item";

export type CompareRequest = { id_a: SampleItemId; id_b: SampleItemId };

export type RawCompareResult = {
  score: number;
  name_a: string;
  name_b: string;
  color_a: string;
  color_b: string;
};

export type CompareResult = {
  score: number;
  nameA: SampleItemName;
  nameB: SampleItemName;
  colorA: string;
  colorB: string;
};
