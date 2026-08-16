"use client";

import { atom, useAtomValue } from "jotai";
import { memo, useCallback, useMemo } from "react";

import { useCanHover } from "#/shared/lib/useCanHover";
import { FloatingLinkPreviewCard, NewsItemLink } from "#/entities/news-item";
import type { NewsItem } from "#/entities/news-item";

import { activePreviewUrlAtom } from "./atoms";
import { usePreviewPlacement } from "./usePreviewPlacement";
import { useHoverPreview } from "./useHoverPreview";

import styles from "./NewsItemPreview.module.css";

type Props = {
  item: NewsItem;
};

const noop = () => {};

export const NewsItemPreview = memo(({ item }: Props) => {
  const canHover = useCanHover();
  const { itemRef, placement, measurePlacement } = usePreviewPlacement();
  const { open, scheduleClose, cancelClose } = useHoverPreview();
  const isPreviewActiveAtom = useMemo(
    () => atom((get) => get(activePreviewUrlAtom) === item.url),
    [item.url],
  );
  const isActive = useAtomValue(isPreviewActiveAtom);

  const handleLinkMouseEnter = useCallback(() => {
    measurePlacement();
    open(item.url);
  }, [measurePlacement, open, item.url]);

  const handleLeave = useCallback(() => {
    scheduleClose(item.url);
  }, [scheduleClose, item.url]);

  return (
    <li ref={itemRef} className={styles.item}>
      <NewsItemLink
        item={item}
        onMouseEnter={canHover ? handleLinkMouseEnter : noop}
        onMouseLeave={canHover ? handleLeave : noop}
      />
      {canHover && (
        <FloatingLinkPreviewCard
          url={item.url}
          active={isActive}
          placement={placement}
          onMouseEnter={cancelClose}
          onMouseLeave={handleLeave}
        />
      )}
    </li>
  );
});
NewsItemPreview.displayName = "NewsItemPreview";
