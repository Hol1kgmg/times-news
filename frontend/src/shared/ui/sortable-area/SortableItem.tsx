"use client";

import type { ReactNode } from "react";
import { useSortable } from "@dnd-kit/react/sortable";
import styles from "./SortableItem.module.css";

type Props = {
  id: string;
  index: number;
  boxId: string;
  children: ReactNode;
};

export const SortableItem = ({ id, index, boxId, children }: Props) => {
  const { ref, isDragging } = useSortable({ id, index, group: boxId });

  return (
    <div
      ref={ref}
      className={isDragging ? `${styles.item} ${styles.dragging}` : styles.item}
    >
      {children}
    </div>
  );
};
