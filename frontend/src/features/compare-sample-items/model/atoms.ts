import { atom } from "jotai";

import type { CompareResult } from "./types";

export const compareResultAtom = atom<CompareResult | null>(null);
