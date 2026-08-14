"use client";

import { useState } from "react";

import styles from "./FaviconIcon.module.css";

type Props = {
  url: string;
};

const getFaviconUrl = (hostname: string): string =>
  `https://www.google.com/s2/favicons?sz=32&domain=${hostname}`;

export const FaviconIcon = ({ url }: Props) => {
  const hostname = new URL(url).hostname;
  const src = getFaviconUrl(hostname);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <svg
        viewBox="0 0 16 16"
        className={styles.faviconFallback}
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M6.354 4.146a.5.5 0 0 1 0 .708L4.207 7l2.147 2.146a.5.5 0 1 1-.708.708l-2.5-2.5a.5.5 0 0 1 0-.708l2.5-2.5a.5.5 0 0 1 .708 0Zm3.292 0a.5.5 0 0 1 .708 0l2.5 2.5a.5.5 0 0 1 0 .708l-2.5 2.5a.5.5 0 0 1-.708-.708L11.793 7 9.646 4.854a.5.5 0 0 1 0-.708Z"
        />
      </svg>
    );
  }

  return (
    <img
      src={src}
      alt={hostname}
      className={styles.favicon}
      onError={() => setFailed(true)}
    />
  );
};
