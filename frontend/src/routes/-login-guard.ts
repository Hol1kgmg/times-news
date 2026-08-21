import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";

import type { LoginAccessKey } from "#/entities/session";
import { timingSafeEqual } from "#/shared/lib/timingSafeEqual";

import { toSessionSecret } from "./api/auth/-adapters";
import { SESSION_COOKIE_NAME, verifySessionCookieValue } from "./api/auth/-session";

const checkLoginAccessKeyServerFn = createServerFn({ method: "GET" })
  .validator((key: unknown) => (typeof key === "string" ? key : undefined))
  .handler(async ({ data: key }) => {
    const sessionSecretEnv = process.env.SESSION_SECRET;
    const sessionCookieValue = getCookie(SESSION_COOKIE_NAME);
    if (sessionSecretEnv !== undefined && sessionCookieValue !== undefined) {
      const payload = await verifySessionCookieValue(sessionCookieValue, toSessionSecret(sessionSecretEnv));
      if (payload !== null) return true;
    }

    const accessKeyEnv = process.env.LOGIN_ACCESS_KEY;
    if (accessKeyEnv === undefined || key === undefined) return false;
    return timingSafeEqual(key, accessKeyEnv);
  });

export const requireLoginAccessKey = async (key: LoginAccessKey | undefined): Promise<void> => {
  const allowed = await checkLoginAccessKeyServerFn({ data: key });
  if (!allowed) {
    throw notFound();
  }
};
