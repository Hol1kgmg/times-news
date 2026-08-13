"use client";

import { useAtomValue } from "jotai";

import { SampleItemCard } from "#/entities/sample-item";
import { isJaAtom } from "#/shared/state/langAtom";
import { compareResultAtom } from "#/features/compare-sample-items";

import styles from "./SampleMatchResultPanel.module.css";

const i18n = {
  ja: { score: (n: number) => `✨ 相性: ${n}%` },
  en: { score: (n: number) => `✨ Compatibility: ${n}%` },
} as const;

export const SampleMatchResultPanel = () => {
  const result = useAtomValue(compareResultAtom);
  const isJa = useAtomValue(isJaAtom);
  const t = isJa ? i18n.ja : i18n.en;

  if (result === null) return null;

  return (
    <div className={styles.panel}>
      <div className={styles.items}>
        <SampleItemCard name={result.nameA} color={result.colorA} />
        <SampleItemCard name={result.nameB} color={result.colorB} />
      </div>
      <p className={styles.score}>{t.score(result.score)}</p>
    </div>
  );
};
