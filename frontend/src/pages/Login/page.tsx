import { Suspense } from "react";

import type { LoginAccessKey, LoginErrorReason } from "#/entities/session";
import { SessionStatus } from "#/entities/session";
import { LoadingSpinner } from "#/shared/ui/LoadingSpinner";

import styles from "./page.module.css";

type Props = {
  loginAccessKey?: LoginAccessKey;
  error?: LoginErrorReason;
};

export const LoginPage = ({ loginAccessKey, error }: Props) => (
  <main className={styles.main}>
    <div className={styles.card}>
      <Suspense fallback={<LoadingSpinner />}>
        <SessionStatus loginAccessKey={loginAccessKey} />
      </Suspense>
      {error === "not_allowed" && (
        <p className={styles.errorMessage}>このGitHubアカウントではログインできません。</p>
      )}
    </div>
  </main>
);
