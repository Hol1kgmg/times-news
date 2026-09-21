"use client";

import { useEffect, useRef, useState } from "react";

import { CATEGORIES } from "#/entities/news-item";
import type { Category } from "#/entities/news-item";
import { brand } from "#/shared/lib/branded";

import type { EditableNewsItem } from "./types";
import styles from "./NewsItemEditorCard.module.css";

type Props = {
  item: EditableNewsItem;
  translating: boolean;
  editing: boolean;
  onTranslate: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onFinishEdit: () => void;
  onTitleChange: (title: string) => void;
  onCategoryChange: (category: Category) => void;
  onDelete: () => void;
};

const toDomain = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").split("/")[0] ?? url;
  }
};

export const NewsItemEditorCard = ({
  item,
  translating,
  editing,
  onTranslate,
  onStartEdit,
  onCancelEdit,
  onFinishEdit,
  onTitleChange,
  onCategoryChange,
  onDelete,
}: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (menuWrapRef.current?.contains(event.target as Node)) return;
      setMenuOpen(false);
    };

    document.addEventListener("click", handleOutsideClick, true);
    return () => document.removeEventListener("click", handleOutsideClick, true);
  }, [menuOpen]);

  const failed = item.fetchStatus === "failed";
  const title = failed && item.title === "" ? "タイトル未取得" : item.title;
  const translateLabel = translating ? "翻訳中" : item.translatedTitle !== undefined ? "もう一度翻訳" : "翻訳する";

  return (
    <div className={styles.card}>
      <div className={styles.body}>
        {editing ? (
          <div className={styles.editForm}>
            <input
              className={styles.titleInput}
              value={item.title}
              onChange={(event) => onTitleChange(event.target.value)}
            />
            <select
              className={styles.categorySelect}
              value={item.category ?? ""}
              onChange={(event) => onCategoryChange(brand<Category>(event.target.value))}
            >
              <option value="" disabled>
                カテゴリを選択
              </option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <div className={styles.editActions}>
              <button type="button" className={styles.primaryButton} onClick={onFinishEdit}>
                保存
              </button>
              <button type="button" className={styles.secondaryButton} onClick={onCancelEdit}>
                キャンセル
              </button>
            </div>
          </div>
        ) : (
          <>
            <span className={`${styles.title} ${failed ? styles.titleFailed : ""}`}>{title}</span>
            {item.translatedTitle !== undefined ? (
              <span className={styles.translatedTitle}>{item.translatedTitle}</span>
            ) : null}
            <span className={styles.meta}>
              {toDomain(item.url)}
              {item.category !== undefined ? ` ・ ${item.category}` : ""}
              {failed ? " ・ 取得できませんでした" : ""}
            </span>
          </>
        )}
      </div>
      {!editing ? (
        <div className={styles.menuWrap} ref={menuWrapRef}>
          <button
            type="button"
            className={styles.menuButton}
            onClick={(event) => {
              event.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
          >
            ···
          </button>
          {menuOpen ? (
            <div className={styles.menu}>
              <button
                type="button"
                className={styles.menuItem}
                disabled={translating}
                onClick={() => {
                  setMenuOpen(false);
                  onTranslate();
                }}
              >
                {translateLabel}
              </button>
              <button
                type="button"
                className={styles.menuItem}
                onClick={() => {
                  setMenuOpen(false);
                  onStartEdit();
                }}
              >
                編集
              </button>
              <button
                type="button"
                className={styles.menuItem}
                onClick={() => {
                  setMenuOpen(false);
                  onDelete();
                }}
              >
                削除
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
