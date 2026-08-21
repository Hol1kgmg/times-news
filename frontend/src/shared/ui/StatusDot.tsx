import styles from "./StatusDot.module.css";

type Variant = "success" | "danger" | "info";

type Props = {
  variant?: Variant;
  ping?: boolean;
};

export const StatusDot = ({ variant = "success", ping = false }: Props) => (
  <span className={`${styles.wrapper} ${styles[variant]}`}>
    {ping && <span className={styles.ping} />}
    <span className={styles.dot} />
  </span>
);
