import { useSyncExternalStore } from "react";

const mqlCache = new Map<string, MediaQueryList>();
const getMql = (query: string) => {
  const cached = mqlCache.get(query);
  if (cached !== undefined) return cached;
  const mql = window.matchMedia(query);
  mqlCache.set(query, mql);
  return mql;
};

// initialValue: SSR/初回レンダリング時点では実際のビューポート幅が分からないため、
// ハイドレーション完了までの間に仮定する値を呼び出し側から指定する（既定はfalse＝非マッチ扱い）
export const useMediaQuery = (query: string, initialValue = false): boolean =>
  useSyncExternalStore(
    (onChange) => {
      const list = getMql(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => getMql(query).matches,
    () => initialValue,
  );
