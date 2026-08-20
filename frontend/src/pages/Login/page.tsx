import { Suspense } from "react";

import { SessionStatus } from "#/entities/session";
import { LoadingSpinner } from "#/shared/ui/LoadingSpinner";

export const LoginPage = () => (
  <main>
    <h1>ログイン</h1>
    <Suspense fallback={<LoadingSpinner />}>
      <SessionStatus />
    </Suspense>
    <a href="/api/auth/github/login">GitHubでログイン</a>
  </main>
);
