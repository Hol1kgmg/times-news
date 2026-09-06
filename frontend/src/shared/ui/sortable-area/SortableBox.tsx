"use client";

import type { CSSProperties, ReactNode } from "react";
import { useDragOperation, useDroppable } from "@dnd-kit/react";
import { SortableItem } from "./SortableItem";
import styles from "./SortableBox.module.css";

type Props<T> = {
  boxId: string;
  items: T[];
  getId: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  title?: ReactNode;
  style?: CSSProperties;
};

export const SortableBox = <T,>({
  boxId,
  items,
  getId,
  renderItem,
  title,
  style,
}: Props<T>) => {
  const { ref } = useDroppable({ id: boxId });
  const { source } = useDragOperation();
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
    <div ref={ref} className={className} style={style}>
      {title != null && (
        <div className={styles.header}>
          <span className={styles.title}>{title}</span>
          {items.length > 0 && <span className={styles.count}>{items.length}</span>}
        </div>
      )}
      {items.map((item, index) => {
        const id = getId(item);
        return (
          <SortableItem key={id} id={id} index={index} boxId={boxId}>
            {renderItem(item)}
          </SortableItem>
        );
      })}
    </div>
  );
};
