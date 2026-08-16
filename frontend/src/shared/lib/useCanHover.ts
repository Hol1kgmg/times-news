import { useSyncExternalStore } from "react";

const QUERY = "(hover: hover)";

let mql: MediaQueryList | null = null;
const getMql = () => (mql ??= window.matchMedia(QUERY));

const subscribe = (onChange: () => void) => {
  const list = getMql();
  list.addEventListener("change", onChange);
  return () => list.removeEventListener("change", onChange);
};

const getSnapshot = () => getMql().matches;
const getServerSnapshot = () => true;

export const useCanHover = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
