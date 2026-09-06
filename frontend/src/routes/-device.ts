import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

import { isMobileUserAgent } from "#/shared/lib/isMobileUserAgent";

const detectIsMobileServerFn = createServerFn({ method: "GET" }).handler(async () =>
  isMobileUserAgent(getRequestHeader("user-agent")),
);

export const detectIsMobile = async (): Promise<boolean> => detectIsMobileServerFn();
