import { CompareSampleItemsForm } from "#/features/compare-sample-items";
import { SampleMatchResultPanel } from "#/widgets/sample-match-result-panel";

import styles from "./page.module.css";

export const SampleMatchPage = () => (
  <main className={styles.main}>
    <CompareSampleItemsForm />
    <SampleMatchResultPanel />
  </main>
);
