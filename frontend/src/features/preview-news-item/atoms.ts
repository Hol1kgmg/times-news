import { atom } from "jotai";

import type { Url } from "#/entities/news-item";

export const activePreviewUrlAtom = atom<Url | null>(null);
