import { createFileRoute } from "@tanstack/react-router";

import { toSessionSecret } from "./-adapters";
import { extractSessionCookieValue, verifySessionCookieValue } from "./-session";

export const Route = createFileRoute("/api/auth/session")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const sessionSecretEnv = process.env.SESSION_SECRET;
        if (sessionSecretEnv === undefined) {
          return new Response("SESSION_SECRET is not configured", { status: 500 });
        }

        const cookieValue = extractSessionCookieValue(request.headers.get("Cookie"));
        if (cookieValue === null) {
          return Response.json({ authenticated: false });
        }

        const payload = await verifySessionCookieValue(cookieValue, toSessionSecret(sessionSecretEnv));
        if (payload === null) {
          return Response.json({ authenticated: false });
        }

        return Response.json({ authenticated: true, login: payload.login });
      },
    },
  },
});
