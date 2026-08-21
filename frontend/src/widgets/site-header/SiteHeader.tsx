"use client";

import { useAtom } from "jotai";
import { Link } from "@tanstack/react-router";

import { sidebarOpenAtom } from "#/shared/state/sidebarOpenAtom";

import { SidebarToggle } from "./SidebarToggle";

import styles from "./SiteHeader.module.css";

export const SiteHeader = () => {
  const [, setIsOpen] = useAtom(sidebarOpenAtom);

  return (
    <div className={styles.mobileHeader}>
      <SidebarToggle onOpen={() => setIsOpen(true)} />
      <Link to="/" className={styles.siteName}>
        Times News
      </Link>
    </div>
  );
};
