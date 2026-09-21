"use client";

import { memo, useState } from "react";
import type { ReactNode } from "react";
import { useDragOperation, useDroppable } from "@dnd-kit/react";
import { SortableItem } from "./SortableItem";
import styles from "./SortableBox.module.css";

// getId / renderItem をメソッド記法で宣言している点に意味がある。
// アロー記法だと strictFunctionTypes により引数が反変になり、memo() が推論する
// Props<unknown> への代入が通らない。メソッド記法は双変のため総称のまま memo に包める。
type Props<T> = {
  boxId: string;
  items: T[];
  getId(item: T): string;
  renderItem(item: T): ReactNode;
  title?: ReactNode;
};

const SortableBoxInner = <T,>({
  boxId,
  items,
  getId,
  renderItem,
  title,
}: Props<T>) => {
  const { ref } = useDroppable({ id: boxId });
  const { source } = useDragOperation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isDragging = source != null;
  const isActiveBox =
    isDragging && items.some((item) => getId(item) === String(source.id));

  const className = [
    styles.box,
    isDragging && styles.dragging,
    isActiveBox && styles.active,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} className={className}>
      {title != null && (
        <div className={styles.header}>
          <button
            type="button"
            className={styles.toggle}
            aria-expanded={!isCollapsed}
            onClick={() => setIsCollapsed((prev) => !prev)}
          >
            <span className={styles.title}>{title}</span>
            {items.length > 0 && <span className={styles.count}>{items.length}</span>}
            <span
              className={[styles.chevron, isCollapsed && styles.chevronCollapsed]
                .filter(Boolean)
                .join(" ")}
            />
          </button>
        </div>
      )}
      <div
        className={[styles.items, isCollapsed && styles.itemsCollapsed]
          .filter(Boolean)
          .join(" ")}
      >
        <div className={styles.itemsInner}>
          {items.map((item, index) => {
            const id = getId(item);
            return (
              <SortableItem key={id} id={id} index={index} boxId={boxId}>
                {renderItem(item)}
              </SortableItem>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// memo() は総称型を潰すため、明示的な総称シグネチャの注釈で呼び出し側の型推論を保つ。
// items / getId / renderItem の参照が安定していれば、ドラッグ中の無関係な box の
// 再レンダリング（配下の SortableItem 含む）をここで打ち切れる。
export const SortableBox: <T>(props: Props<T>) => ReactNode = memo(SortableBoxInner);
