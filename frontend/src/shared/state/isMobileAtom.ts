import { atom } from "jotai";

// SSRでUser-Agentから判定した初期値を保持するだけのatom。
export const isMobileAtom = atom(false);
