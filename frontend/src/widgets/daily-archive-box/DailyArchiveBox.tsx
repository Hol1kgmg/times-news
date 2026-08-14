"use client";

import { useArchive } from "#/aggregates/archive";
import type { ArchiveDate } from "#/entities/archive-date";
import { CATEGORIES } from "#/entities/news-item";
import { NewsItemPreview } from "#/features/preview-news-item";

import styles from "./DailyArchiveBox.module.css";

type Props = {
  date: ArchiveDate;
};

export const DailyArchiveBox = ({ date }: Props) => {
  const { data: archive } = useArchive(date);

  if (archive.items.length === 0) {
    return (
      <section className={styles.box}>
        <p className={styles.empty}>アーカイブがありません</p>
      </section>
    );
  }

  return (
    <section className={styles.box}>
      <h2 className={styles.date}>{archive.date}</h2>
      {CATEGORIES.map((category) => {
        const items = archive.items.filter((item) => item.category === category);
        if (items.length === 0) return null;

        return (
          <div key={category} className={styles.categoryGroup}>
            <h3 className={styles.categoryTitle}>{category}</h3>
            <ul className={styles.itemList}>
              {items.map((item) => (
                <NewsItemPreview key={item.url} item={item} />
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
};
