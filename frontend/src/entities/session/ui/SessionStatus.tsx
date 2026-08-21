"use client";

import { StatusDot } from "#/shared/ui/StatusDot";

import type { LoginAccessKey } from "../model/types";
import { useSessionStatus } from "../useSessionStatus";
import { GithubLoginButton } from "./GithubLoginButton";

import styles from "./SessionStatus.module.css";

type Props = {
  loginAccessKey?: LoginAccessKey;
};

export const SessionStatus = ({ loginAccessKey }: Props) => {
  const { data: session } = useSessionStatus();

  const logoutHref =
    loginAccessKey === undefined
      ? "/api/auth/logout"
      : `/api/auth/logout?key=${encodeURIComponent(loginAccessKey)}`;

  return session.authenticated ? (
    <div className={styles.authenticatedWrapper}>
      <p className={styles.status}>
        <StatusDot ping />
        {session.login} でログイン中
      </p>
      <a className={styles.logoutButton} href={logoutHref}>
        ログアウト
      </a>
    </div>
  ) : (
    <GithubLoginButton loginAccessKey={loginAccessKey} />
  );
};
