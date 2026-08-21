import { createFileRoute } from "@tanstack/react-router";

import { buildSessionCookieClearHeader } from "./-session";

export const Route = createFileRoute("/api/auth/logout")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const requestUrl = new URL(request.url);
        const cookieHeader = buildSessionCookieClearHeader(requestUrl.protocol === "https:");
        const key = requestUrl.searchParams.get("key");
        const location = key === null ? "/login" : `/login?key=${encodeURIComponent(key)}`;

        return new Response(null, {
          status: 302,
          headers: {
            Location: location,
            "Set-Cookie": cookieHeader,
          },
        });
      },
    },
  },
});
