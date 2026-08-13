import type { SampleItemName } from "../model/types";
import styles from "./SampleItemCard.module.css";

type Props = {
  name: SampleItemName;
  color: string;
};

export const SampleItemCard = ({ name, color }: Props) => (
  <div className={styles.item}>
    <div className={styles.swatch} style={{ backgroundColor: color }} />
    <p className={styles.itemName}>{name}</p>
  </div>
);
