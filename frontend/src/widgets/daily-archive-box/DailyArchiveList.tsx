"use client";

import { useArchiveDates } from "#/entities/archive-date";

import { DailyArchiveBox } from "./DailyArchiveBox";
import { useArchiveDisplayLimit } from "./useArchiveDisplayLimit";

import styles from "./DailyArchiveList.module.css";

export const DailyArchiveList = () => {
  const { data: dates } = useArchiveDates();
  const limit = useArchiveDisplayLimit();
  const displayDates = dates.slice(0, limit);

  if (displayDates.length === 0) {
    return (
      <section className={styles.box}>
        <p className={styles.empty}>アーカイブがありません</p>
      </section>
    );
  }

  return (
    <>
      {displayDates.map((date) => (
        <DailyArchiveBox key={date} date={date} />
      ))}
    </>
  );
};
