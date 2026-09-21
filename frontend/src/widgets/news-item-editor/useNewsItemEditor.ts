"use client";

import { useCallback, useState } from "react";

import type { Category, Url } from "#/entities/news-item";

import { createMockNewsItems } from "./mockData";
import type { EditableNewsItem } from "./types";

const mockTranslate = async (title: string): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return `【翻訳】${title}`;
};

export const useNewsItemEditor = () => {
  const [items, setItems] = useState<EditableNewsItem[]>(createMockNewsItems);
  const [translatingUrl, setTranslatingUrl] = useState<Url | undefined>(undefined);
  const [editingUrl, setEditingUrl] = useState<Url | undefined>(undefined);

  const translateItem = useCallback(async (url: Url) => {
    setTranslatingUrl(url);
    setItems((prev) => {
      const target = prev.find((item) => item.url === url);
      if (target === undefined) return prev;
      mockTranslate(target.title).then((translatedTitle) => {
        setItems((current) =>
          current.map((item) => (item.url === url ? { ...item, translatedTitle } : item)),
        );
        setTranslatingUrl((current) => (current === url ? undefined : current));
      });
      return prev;
    });
  }, []);

  const startEdit = useCallback((url: Url) => {
    setEditingUrl(url);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingUrl(undefined);
  }, []);

  const updateTitle = useCallback((url: Url, title: string) => {
    setItems((prev) => prev.map((item) => (item.url === url ? { ...item, title } : item)));
  }, []);

  const updateCategory = useCallback((url: Url, category: Category) => {
    setItems((prev) => prev.map((item) => (item.url === url ? { ...item, category } : item)));
  }, []);

  const finishEdit = useCallback(() => {
    setEditingUrl(undefined);
  }, []);

  const deleteItem = useCallback((url: Url) => {
    setItems((prev) => prev.filter((item) => item.url !== url));
  }, []);

  return {
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
  };
};
