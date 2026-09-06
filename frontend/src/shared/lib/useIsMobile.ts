import { useAtomValue } from "jotai";

import { MOBILE_QUERY } from "./breakpoints";
import { useMediaQuery } from "./useMediaQuery";
import { isMobileAtom } from "#/shared/state/isMobileAtom";

// isMobileAtom: root loaderがサーバー側でUser-Agentから判定した値でハイドレートする。
export const useIsMobile = (): boolean => useMediaQuery(MOBILE_QUERY, useAtomValue(isMobileAtom));
