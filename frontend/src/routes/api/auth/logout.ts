import { createFileRoute } from "@tanstack/react-router";

import { buildSessionCookieClearHeader } from "./-session";

export const Route = createFileRoute("/api/auth/logout")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const requestUrl = new URL(request.url);
        const cookieHeader = buildSessionCookieClearHeader(requestUrl.protocol === "https:");

        return new Response(null, {
          status: 302,
          headers: {
            Location: "/login",
            "Set-Cookie": cookieHeader,
          },
        });
      },
    },
  },
});
