import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";

const resolveApiUrlFn = createIsomorphicFn()
  .client((path: string) => path)
  .server((path: string) => new URL(path, getRequestUrl().origin).toString());

export const resolveApiUrl = (path: string): string => resolveApiUrlFn(path);
