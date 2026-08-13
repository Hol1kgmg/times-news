import { brand } from "#/shared/lib/branded";
import type { SampleItemName } from "#/entities/sample-item";

import type { CompareResult, RawCompareResult } from "./types";

export const toCompareResult = (raw: unknown): CompareResult => {
  const r = raw as RawCompareResult;
  return {
    score: r.score,
    nameA: brand<SampleItemName>(r.name_a),
    nameB: brand<SampleItemName>(r.name_b),
    colorA: r.color_a,
    colorB: r.color_b,
  };
};
