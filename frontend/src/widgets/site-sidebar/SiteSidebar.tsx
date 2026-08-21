"use client";

import { useAtom } from "jotai";
import type { KeyboardEvent } from "react";
import { Link } from "@tanstack/react-router";

import { sidebarOpenAtom } from "#/shared/state/sidebarOpenAtom";

import styles from "./SiteSidebar.module.css";

const navLinks = [
  { href: "#link-1", label: "リンク1" },
  { href: "#link-2", label: "リンク2" },
  { href: "#link-3", label: "リンク3" },
] as const;

export const SiteSidebar = () => {
  const [isOpen, setIsOpen] = useAtom(sidebarOpenAtom);

  const close = () => setIsOpen(false);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      close();
    }
  };

  return (
    <>
      {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- Escapeキーでのサイドバー閉じるためのハンドラ */}
      <aside
        className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}
        onKeyDown={handleKeyDown}
      >
        <Link to="/" className={styles.siteName}>
          Times News
        </Link>
        <nav className={styles.nav} aria-label="サイドナビゲーション">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className={styles.link} onClick={close}>
              {link.label}
            </a>
          ))}
        </nav>
      </aside>
      {isOpen && (
        // oxlint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events -- モバイルでサイドバー外タップして閉じるためのオーバーレイ
        <div className={styles.overlay} onClick={close} />
      )}
    </>
  );
};
