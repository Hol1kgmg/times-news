"use client";

import type { Url } from "../model/types";
import { useLinkPreview } from "../useLinkPreview";

import styles from "./LinkPreviewCard.module.css";

type Props = {
  url: Url;
  active: boolean;
  placement: "above" | "below";
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

export const LinkPreviewCard = ({
  url,
  active,
  placement,
  onMouseEnter,
  onMouseLeave,
}: Props) => {
  const { preview, loading, error } = useLinkPreview(url, active);

  if (!active) return null;

  const placementClass =
    placement === "above" ? styles.previewCardAbove : styles.previewCardBelow;

  return (
    <div
      className={`${styles.previewCard} ${placementClass}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {loading && <div className={styles.previewSkeleton} />}
      {!loading && error && (
        <p className={styles.previewError}>サイト情報取得失敗</p>
      )}
      {!loading && !error && preview !== null && (
        <>
          {preview.image !== null && (
            <img src={preview.image} alt="" className={styles.previewImage} />
          )}
          {preview.description !== null && (
            <p className={styles.previewDescription}>{preview.description}</p>
          )}
        </>
      )}
    </div>
  );
};
