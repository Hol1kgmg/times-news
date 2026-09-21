import type { Category, Url } from "#/entities/news-item";

export type EditableNewsItem = {
  url: Url;
  title: string;
  translatedTitle: string | undefined;
  category: Category | undefined;
  fetchStatus: "succeeded" | "failed";
};
