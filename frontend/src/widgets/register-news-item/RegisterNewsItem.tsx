"use client";

import { useState } from "react";

import { RandomUrlButton } from "./RandomUrlButton";
import { useIsMobile } from "#/shared/lib/useIsMobile";
import { SortableArea } from "#/shared/ui/sortable-area";
import type { Layout } from "#/shared/ui/sortable-area";

// 左を1個・右に残り全部を縦積み（左右はドラッグでリサイズ可能）
const desktopLayout: Layout = {
  direction: "horizontal",
  areas: [
    { count: 1, size: 50 },
    { layout: { direction: "vertical", areas: [{}] } },
  ],
};

// モバイル幅では横分割が崩れるため、全boxを縦一列に積む
const mobileLayout: Layout = {
  direction: "vertical",
  areas: [{}],
};

export type RegisterItem = {
  id: string;
  itemName: string;
};

const initialBoxes: Record<string, RegisterItem[]> = {
  areaA: [],
  areaB: [],
  areaC: [],
};

export const RegisterNewsItem = () => {
  const [boxes, setBoxes] = useState(initialBoxes);
  const isMobile = useIsMobile();

  const addItem = (item: RegisterItem): "added" | "duplicate" => {
    const exists = Object.values(boxes)
      .flat()
      .some((existing) => existing.id === item.id);
    if (exists) return "duplicate";
    setBoxes((prev) => ({ ...prev, areaA: [...prev.areaA, item] }));
    return "added";
  };

  return (
    <main>
      <h1>記事登録</h1>
      <RandomUrlButton addItem={addItem} />
      <SortableArea
        value={boxes}
        onChange={setBoxes}
        getId={(item) => item.id}
        renderItem={(item) => item.itemName}
        renderBoxTitle={(boxId) => boxId}
        layout={isMobile ? mobileLayout : desktopLayout}
      />
    </main>
  );
};
