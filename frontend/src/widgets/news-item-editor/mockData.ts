import { brand } from "#/shared/lib/branded";
import type { Url } from "#/entities/news-item";

import type { EditableNewsItem } from "./types";

export const createMockNewsItems = (): EditableNewsItem[] => [
  {
    url: brand<Url>("https://example.com/articles/typescript-5-8"),
    title: "TypeScript 5.8 released with new features",
    translatedTitle: undefined,
    category: undefined,
    fetchStatus: "succeeded",
  },
  {
    url: brand<Url>("https://example.com/articles/react-19-hooks"),
    title: "Understanding React 19's new hooks",
    translatedTitle: undefined,
    category: undefined,
    fetchStatus: "succeeded",
  },
  {
    url: brand<Url>("https://example.com/articles/unreachable"),
    title: "",
    translatedTitle: undefined,
    category: undefined,
    fetchStatus: "failed",
  },
];
