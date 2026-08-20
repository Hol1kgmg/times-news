import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";

import { toSessionSecret } from "./api/auth/-adapters";
import { SESSION_COOKIE_NAME, verifySessionCookieValue } from "./api/auth/-session";

const checkSessionServerFn = createServerFn({ method: "GET" }).handler(async () => {
  const sessionSecretEnv = process.env.SESSION_SECRET;
  if (sessionSecretEnv === undefined) return false;

  const cookieValue = getCookie(SESSION_COOKIE_NAME);
  if (cookieValue === undefined) return false;

  const payload = await verifySessionCookieValue(cookieValue, toSessionSecret(sessionSecretEnv));
  return payload !== null;
});

export const requireSession = async (): Promise<void> => {
  const authenticated = await checkSessionServerFn();
  if (!authenticated) {
    throw notFound();
  }
};
