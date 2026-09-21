"use client";

import { NewsItemEditorCard } from "./NewsItemEditorCard";
import { UrlInputPreview } from "./UrlInputPreview";
import { useNewsItemEditor } from "./useNewsItemEditor";
import styles from "./NewsItemEditor.module.css";

export const NewsItemEditor = () => {
  const {
    items,
    translatingUrl,
    editingUrl,
    translateItem,
    startEdit,
    cancelEdit,
    updateTitle,
    updateCategory,
    finishEdit,
    deleteItem,
  } = useNewsItemEditor();

  return (
    <main className={styles.main}>
      <h1>item編集UI 検証</h1>
      <UrlInputPreview />
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.url}>
            <NewsItemEditorCard
              item={item}
              translating={translatingUrl === item.url}
              editing={editingUrl === item.url}
              onTranslate={() => translateItem(item.url)}
              onStartEdit={() => startEdit(item.url)}
              onCancelEdit={cancelEdit}
              onFinishEdit={finishEdit}
              onTitleChange={(title) => updateTitle(item.url, title)}
              onCategoryChange={(category) => updateCategory(item.url, category)}
              onDelete={() => deleteItem(item.url)}
            />
          </li>
        ))}
      </ul>
    </main>
  );
};
