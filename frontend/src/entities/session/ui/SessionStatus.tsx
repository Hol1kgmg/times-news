"use client";

import { useSessionStatus } from "../useSessionStatus";

export const SessionStatus = () => {
  const { data: session } = useSessionStatus();

  return session.authenticated ? (
    <p>
      ログイン中: {session.login}（<a href="/api/auth/logout">ログアウト</a>）
    </p>
  ) : (
    <p>未ログインです</p>
  );
};
