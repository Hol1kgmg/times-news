"use client";

import { useState } from "react";
import Select, { components } from "react-select";
import type { InputProps, GroupBase } from "react-select";
import { useAtomValue } from "jotai";

import { isJaAtom } from "#/shared/state/langAtom";

import { useCompareSampleItems } from "../hooks/useCompareSampleItems";
import type { SampleItemOption } from "../hooks/useSampleItemOptions";
import { useSampleItemOptions } from "../hooks/useSampleItemOptions";
import styles from "./CompareSampleItemsForm.module.css";

const SelectInput = ({ "aria-activedescendant": ariaActiveDescendant, ...props }: InputProps<SampleItemOption, boolean, GroupBase<SampleItemOption>>) => (
  <components.Input {...props} aria-activedescendant={ariaActiveDescendant || undefined} />
);

const i18n = {
  ja: {
    title: "サンプル相性診断",
    placeholderA: "アイテムA を選択",
    placeholderB: "アイテムB を選択",
    submit: "比較する",
    submitting: "比較中…",
    error: "IDが正しくないか、存在しないサンプルアイテムです。",
  },
  en: {
    title: "Sample Compatibility",
    placeholderA: "Select Item A",
    placeholderB: "Select Item B",
    submit: "Compare",
    submitting: "Comparing…",
    error: "Invalid item. Please check the selection.",
  },
} as const;

export const CompareSampleItemsForm = () => {
  const [selectedA, setSelectedA] = useState<SampleItemOption | null>(null);
  const [selectedB, setSelectedB] = useState<SampleItemOption | null>(null);
  const isJa = useAtomValue(isJaAtom);
  const t = isJa ? i18n.ja : i18n.en;
  const { options, loading: optionsLoading } = useSampleItemOptions();
  const { compare, loading: comparing, error } = useCompareSampleItems();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedA === null || selectedB === null) return;
    await compare({ id_a: selectedA.value, id_b: selectedB.value });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t.title}</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputs}>
          <Select
            instanceId="sample-item-a"
            isMulti={false}
            options={options}
            value={selectedA}
            onChange={(opt) => setSelectedA(opt)}
            isLoading={optionsLoading}
            placeholder={t.placeholderA}
            aria-label={t.placeholderA}
            components={{ Input: SelectInput }}
            className={styles.select}
            classNamePrefix="react-select"
          />
          <Select
            instanceId="sample-item-b"
            isMulti={false}
            options={options}
            value={selectedB}
            onChange={(opt) => setSelectedB(opt)}
            isLoading={optionsLoading}
            placeholder={t.placeholderB}
            aria-label={t.placeholderB}
            components={{ Input: SelectInput }}
            className={styles.select}
            classNamePrefix="react-select"
          />
        </div>
        <button
          type="submit"
          disabled={comparing || selectedA === null || selectedB === null}
          className={styles.button}
        >
          {comparing ? t.submitting : t.submit}
        </button>
      </form>
      {error !== null && <p className={styles.error}>{t.error}</p>}
    </div>
  );
};
