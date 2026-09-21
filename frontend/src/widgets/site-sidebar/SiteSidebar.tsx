"use client";

import { useAtom } from "jotai";
import { Link } from "@tanstack/react-router";

import { sidebarOpenAtom } from "#/shared/state/sidebarOpenAtom";

import styles from "./SiteSidebar.module.css";

const navLinks = [
  { href: "/admin/register", label: "新規Digest" },
  { href: "/times", label: "timesリスト" },
  { href: "/sandbox/news-item-editor-preview", label: "item編集UI 検証" },
  { href: "/sandbox/dnd-sandbox", label: "dnd-kit 検証" },
] as const;

export const SiteSidebar = () => {
  const [isOpen, setIsOpen] = useAtom(sidebarOpenAtom);

  const close = () => setIsOpen(false);

  return (
    <>
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
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
