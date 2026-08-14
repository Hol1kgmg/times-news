"use client";

import { memo } from "react";

import { FaviconIcon } from "#/shared/ui/FaviconIcon";

import type { NewsItem } from "../model/types";

import styles from "./NewsItemLink.module.css";

type Props = {
  item: NewsItem;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

export const NewsItemLink = memo(({ item, onMouseEnter, onMouseLeave }: Props) => (
  <div className={styles.itemRow}>
    <FaviconIcon url={item.url} />
    <div className={styles.itemLinkWrap}>
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.itemLink}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {item.title}
      </a>
    </div>
  </div>
));
NewsItemLink.displayName = "NewsItemLink";
