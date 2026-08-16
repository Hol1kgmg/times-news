"use client";

import type { Url } from "../model/types";

import { LinkPreviewCard } from "./LinkPreviewCard";

import styles from "./FloatingLinkPreviewCard.module.css";

type Props = {
  url: Url;
  active: boolean;
  placement: "above" | "below";
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

export const FloatingLinkPreviewCard = ({
  url,
  active,
  placement,
  onMouseEnter,
  onMouseLeave,
}: Props) => {
  if (!active) return null;

  const placementClass = placement === "above" ? styles.floatingAbove : styles.floatingBelow;

  return (
    <div
      className={`${styles.floating} ${placementClass}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <LinkPreviewCard url={url} active={active} />
    </div>
  );
};
