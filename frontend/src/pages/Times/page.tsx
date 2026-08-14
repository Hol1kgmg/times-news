import { Suspense } from "react";

import { LoadingSpinner } from "#/shared/ui/LoadingSpinner";
import { DailyArchiveList } from "#/widgets/daily-archive-box";

import styles from "./page.module.css";

export const TimesPage = () => (
  <main className={styles.main}>
    <Suspense fallback={<LoadingSpinner />}>
      <DailyArchiveList />
    </Suspense>
  </main>
);
