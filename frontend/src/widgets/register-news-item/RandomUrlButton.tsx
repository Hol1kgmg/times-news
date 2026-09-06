"use client";

import { useRef } from "react";

import type { RegisterItem } from "./RegisterNewsItem";

import styles from "./RandomUrlButton.module.css";

type Props = {
  addItem: (item: RegisterItem) => "added" | "duplicate";
};

const randomSlug = (): string => Math.random().toString(36).slice(2, 10);

export const RandomUrlButton = ({ addItem }: Props) => {
  const countRef = useRef(0);

  const handleClick = () => {
    countRef.current += 1;
    addItem({ id: randomSlug(), itemName: `ダミータイトル${countRef.current}` });
  };

  return (
    <button type="button" className={styles.button} onClick={handleClick}>
      ランダムURLを追加
    </button>
  );
};
