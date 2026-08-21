import type { LoginAccessKey } from "../model/types";

import { GithubIcon } from "#/shared/ui/icons/GithubIcon";

import styles from "./GithubLoginButton.module.css";

type Props = {
  loginAccessKey?: LoginAccessKey;
};

export const GithubLoginButton = ({ loginAccessKey }: Props) => {
  const loginHref =
    loginAccessKey === undefined
      ? "/api/auth/github/login"
      : `/api/auth/github/login?key=${encodeURIComponent(loginAccessKey)}`;

  return (
    <a className={styles.loginLink} href={loginHref}>
      <GithubIcon size={18} />
      GitHubでログイン
    </a>
  );
};
