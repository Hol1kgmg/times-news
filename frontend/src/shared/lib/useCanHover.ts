import { useAtomValue } from "jotai";

import { useMediaQuery } from "./useMediaQuery";
import { isMobileAtom } from "#/shared/state/isMobileAtom";

const QUERY = "(hover: hover)";

// isMobileAtom: root loaderがサーバー側でUser-Agentから判定した値を流用する。
export const useCanHover = (): boolean => useMediaQuery(QUERY, !useAtomValue(isMobileAtom));
