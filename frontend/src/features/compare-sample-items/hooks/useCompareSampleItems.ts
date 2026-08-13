"use client";

import { useState } from "react";
import { useSetAtom } from "jotai";

import { toCompareResult } from "../model/adapters";
import { compareResultAtom } from "../model/atoms";
import type { CompareRequest } from "../model/types";

export const useCompareSampleItems = () => {
  const setCompareResult = useSetAtom(compareResultAtom);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const compare = async (request: CompareRequest) => {
    setError(null);
    setCompareResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/sample/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      if (!res.ok) throw new Error(`compare API error: ${res.status}`);
      setCompareResult(toCompareResult(await res.json()));
    } catch {
      setError("IDが正しくないか、存在しないサンプルアイテムです。");
    } finally {
      setLoading(false);
    }
  };

  return { compare, loading, error };
};
