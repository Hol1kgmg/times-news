import { createFileRoute } from "@tanstack/react-router";

import { toGithubLogin, toRawGithubTokenResponse, toRawGithubUserResponse, toSessionSecret } from "../-adapters";
import {
  buildOauthStateCookieClearHeader,
  buildSessionCookieHeader,
  createSessionCookieValue,
  extractOauthStateCookieValue,
} from "../-session";

export const Route = createFileRoute("/api/auth/github/callback")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const clientId = process.env.GITHUB_CLIENT_ID;
        const clientSecret = process.env.GITHUB_CLIENT_SECRET;
        if (clientId === undefined || clientSecret === undefined) {
          return new Response("GitHub OAuth is not configured", { status: 500 });
        }

        const requestUrl = new URL(request.url);
        const code = requestUrl.searchParams.get("code");
        if (code === null) {
          return new Response("Missing code", { status: 400 });
        }

        const state = requestUrl.searchParams.get("state");
        const expectedState = extractOauthStateCookieValue(request.headers.get("Cookie"));
        const isHttps = requestUrl.protocol === "https:";
        if (state === null || expectedState === null || state !== expectedState) {
          return new Response("Invalid state", {
            status: 400,
            headers: { "Set-Cookie": buildOauthStateCookieClearHeader(isHttps) },
          });
        }

        const redirectUri = `${requestUrl.origin}/api/auth/github/callback`;

        const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            code,
            redirect_uri: redirectUri,
          }),
        });
        const tokenJson = toRawGithubTokenResponse(await tokenRes.json());
        if (tokenJson.access_token === undefined) {
          // TODO: デバッグ用の一時実装。tokenJsonをそのまま返さず、汎用エラーメッセージに簡略化する（Phase2振り分け時に対応）
          return Response.json(
            { step: "token_exchange_failed", detail: tokenJson },
            { status: 400 },
          );
        }

        const userRes = await fetch("https://api.github.com/user", {
          headers: {
            Authorization: `Bearer ${tokenJson.access_token}`,
            "User-Agent": "times-news-login",
            Accept: "application/vnd.github+json",
          },
        });
        if (!userRes.ok) {
          return Response.json({ step: "user_fetch_failed", status: userRes.status }, { status: 400 });
        }
        const user = toRawGithubUserResponse(await userRes.json());

        const allowedLogin = process.env.GITHUB_ALLOWED_LOGIN;
        if (allowedLogin === undefined) {
          return new Response("GITHUB_ALLOWED_LOGIN is not configured", { status: 500 });
        }

        const login = toGithubLogin(user.login);
        if (login.toLowerCase() !== toGithubLogin(allowedLogin).toLowerCase()) {
          return Response.json({ step: "not_allowed", login }, { status: 403 });
        }

        const sessionSecretEnv = process.env.SESSION_SECRET;
        if (sessionSecretEnv === undefined) {
          return new Response("SESSION_SECRET is not configured", { status: 500 });
        }
        const sessionSecret = toSessionSecret(sessionSecretEnv);

        const cookieValue = await createSessionCookieValue(login, sessionSecret);
        const cookieHeader = buildSessionCookieHeader(cookieValue, isHttps);

        // Step4: セッションCookieを発行してトップページへリダイレクト。stateCookieは検証完了に伴い破棄する。
        const responseHeaders = new Headers({ Location: "/" });
        responseHeaders.append("Set-Cookie", cookieHeader);
        responseHeaders.append("Set-Cookie", buildOauthStateCookieClearHeader(isHttps));

        return new Response(null, { status: 302, headers: responseHeaders });
      },
    },
  },
});
