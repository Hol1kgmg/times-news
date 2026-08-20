import { createFileRoute } from "@tanstack/react-router";

import { buildOauthStateCookieHeader, createOauthState } from "../-session";

export const Route = createFileRoute("/api/auth/github/login")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const clientId = process.env.GITHUB_CLIENT_ID;
        if (clientId === undefined) {
          return new Response("GITHUB_CLIENT_ID is not configured", { status: 500 });
        }

        const requestUrl = new URL(request.url);
        const redirectUri = `${requestUrl.origin}/api/auth/github/callback`;

        const state = createOauthState();
        const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
        authorizeUrl.searchParams.set("client_id", clientId);
        authorizeUrl.searchParams.set("redirect_uri", redirectUri);
        authorizeUrl.searchParams.set("state", state);

        return new Response(null, {
          status: 302,
          headers: {
            Location: authorizeUrl.toString(),
            "Set-Cookie": buildOauthStateCookieHeader(state, requestUrl.protocol === "https:"),
          },
        });
      },
    },
  },
});
