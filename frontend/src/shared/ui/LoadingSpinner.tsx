import styles from "./LoadingSpinner.module.css";

export const LoadingSpinner = () => (
  <output className={styles.wrap} aria-label="Loading">
    <div className={styles.spinner} />
  </output>
);
