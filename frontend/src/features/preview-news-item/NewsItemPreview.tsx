"use client";

import { atom, useAtomValue } from "jotai";
import { memo, useCallback, useMemo } from "react";

import { LinkPreviewCard, NewsItemLink } from "#/entities/news-item";
import type { NewsItem } from "#/entities/news-item";

import { activePreviewUrlAtom } from "./atoms";
import { usePreviewPlacement } from "./usePreviewPlacement";
import { useHoverPreview } from "./useHoverPreview";

import styles from "./NewsItemPreview.module.css";

type Props = {
  item: NewsItem;
};

export const NewsItemPreview = memo(({ item }: Props) => {
  const { itemRef, placement, measurePlacement } = usePreviewPlacement();
  const { open, scheduleClose, cancelClose } = useHoverPreview();
  const isActiveAtom = useMemo(
    () => atom((get) => get(activePreviewUrlAtom) === item.url),
    [item.url],
  );
  const isActive = useAtomValue(isActiveAtom);

  const handleLinkMouseEnter = useCallback(() => {
    measurePlacement();
    open(item.url);
  }, [measurePlacement, open, item.url]);

  const handleLeave = useCallback(() => {
    scheduleClose(item.url);
  }, [scheduleClose, item.url]);

  return (
    <li ref={itemRef} className={styles.item}>
      <NewsItemLink item={item} onMouseEnter={handleLinkMouseEnter} onMouseLeave={handleLeave} />
      <LinkPreviewCard
        url={item.url}
        active={isActive}
        placement={placement}
        onMouseEnter={cancelClose}
        onMouseLeave={handleLeave}
      />
    </li>
  );
});
NewsItemPreview.displayName = "NewsItemPreview";
