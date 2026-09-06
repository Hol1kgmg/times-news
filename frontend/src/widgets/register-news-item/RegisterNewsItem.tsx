"use client";

import { useState } from "react";

import { RandomUrlButton } from "./RandomUrlButton";
import { buildLeftFixedLayout, SortableArea } from "#/shared/ui/sortable-area";

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
        layout={buildLeftFixedLayout(Object.keys(boxes).length)}
      />
    </main>
  );
};
