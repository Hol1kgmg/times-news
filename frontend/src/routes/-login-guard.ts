import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { timingSafeEqual } from "#/shared/lib/timingSafeEqual";

const checkLoginAccessKeyServerFn = createServerFn({ method: "GET" })
  .validator((key: unknown) => (typeof key === "string" ? key : undefined))
  .handler(async ({ data: key }) => {
    const accessKeyEnv = process.env.LOGIN_ACCESS_KEY;
    if (accessKeyEnv === undefined || key === undefined) return false;
    return timingSafeEqual(key, accessKeyEnv);
  });

export const requireLoginAccessKey = async (key: string | undefined): Promise<void> => {
  const allowed = await checkLoginAccessKeyServerFn({ data: key });
  if (!allowed) {
    throw notFound();
  }
};
