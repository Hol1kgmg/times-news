"use client";

// 複数のBox間でアイテムをドラッグ＆ドロップして並び替える汎用UI。
// アイテムの識別・表示はすべて呼び出し側が getId / renderItem で注入する（ドメイン知識を持たない）。

import type { ReactNode } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { SortableBox } from "./SortableBox";
import { renderLayoutTree } from "./renderLayoutTree";
import type { Layout } from "./renderLayoutTree";
import styles from "./SortableArea.module.css";

type Props<T> = {
  value: Record<string, T[]>;
  onChange: (value: Record<string, T[]>) => void;
  getId: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  renderBoxTitle?: (boxId: string) => ReactNode;
  layout?: Layout;
};

export const SortableArea = <T,>({
  value,
  onChange,
  getId,
  renderItem,
  renderBoxTitle,
  layout,
}: Props<T>) => {
  const itemsById = new Map<string, T>();
  const idsByBox: Record<string, string[]> = {};
  for (const [boxId, items] of Object.entries(value)) {
    idsByBox[boxId] = items.map((item) => {
      const id = getId(item);
      itemsById.set(id, item);
      return id;
    });
  }

  const boxes = Object.entries(value).map(([boxId, items]) => ({ boxId, items }));

  return (
    <DragDropProvider
      onDragOver={(event) => {
        const nextIdsByBox = move(idsByBox, event);
        const next: Record<string, T[]> = {};
        for (const [boxId, ids] of Object.entries(nextIdsByBox)) {
          next[boxId] = ids.map((id) => {
            const item = itemsById.get(id);
            if (item === undefined) {
              throw new Error(`SortableArea: unknown item id "${id}"`);
            }
            return item;
          });
        }
        onChange(next);
      }}
    >
      <div className={styles.area}>
        {layout === undefined
          ? boxes.map(({ boxId, items }) => (
              <SortableBox
                key={boxId}
                boxId={boxId}
                items={items}
                getId={getId}
                renderItem={renderItem}
                title={renderBoxTitle?.(boxId)}
              />
            ))
          : renderLayoutTree({ layout, boxes, getId, renderItem, renderBoxTitle })}
      </div>
    </DragDropProvider>
  );
};
