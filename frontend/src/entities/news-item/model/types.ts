import type { Branded } from "#/shared/lib/branded";

export type EntryDate = Branded<string, "EntryDate">;
export type Url = Branded<string, "Url">;

export const CATEGORIES = ["IT系", "AI系", "面白そうなツール", "その他"] as const;
type CategoryValue = (typeof CATEGORIES)[number];
export type Category = Branded<CategoryValue, "Category">;

export type RawNewsItem = {
  category: string;
  title: string;
  url: string;
  entry_date: string;
};

export type NewsItem = {
  category: Category;
  title: string;
  url: Url;
  entryDate: EntryDate;
};
