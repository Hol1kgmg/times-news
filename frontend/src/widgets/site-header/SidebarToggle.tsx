"use client";

import { VscThreeBars } from "react-icons/vsc";

import styles from "./SidebarToggle.module.css";

type Props = {
  onOpen: () => void;
};

export const SidebarToggle = ({ onOpen }: Props) => (
  <button type="button" className={styles.button} aria-label="メニューを開く" onClick={onOpen}>
    <VscThreeBars className={styles.icon} role="presentation" focusable="false" />
  </button>
);
