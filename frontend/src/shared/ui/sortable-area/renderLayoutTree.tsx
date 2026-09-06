"use client";

// SortableArea の box 配置ツリーを、value の中身（キー名）に依存せず
// 「個数・位置」だけで解決して要素へ変換する。
//
// - direction: "horizontal" … react-resizable-panels でドラッグリサイズ可能な分割にする
// - direction: "vertical"   … 素の flexbox で縦に積む（中身の量に応じて高さが自動で伸び、
//   スクロールもリサイズハンドルも持たない）

import type { ReactNode } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { SortableBox } from "./SortableBox";
import styles from "./SortableArea.module.css";

/**
 * box の分割構成を、value の中身（キー名）に依存せず「個数・位置」だけで指定するための設定。
 * ツリーを深さ優先で辿ったときの `{ type: "box" }` の出現順が、
 * `Object.entries(value)` の出現順に対応する。
 *
 * @example 左右50/50（ドラッグでリサイズ可能）
 * ```
 * { type: "split", direction: "horizontal", children: [{ type: "box" }, { type: "box" }] }
 * ```
 *
 * @example 1つ目を左半分に縦通し、残り2つを右側に縦積み（縦積み側は中身の量に応じて自動で高さが伸びる）
 * ```
 * {
 *   type: "split",
 *   direction: "horizontal",
 *   sizes: [50, 50],
 *   children: [
 *     { type: "box" },
 *     { type: "split", direction: "vertical", children: [{ type: "box" }, { type: "box" }] },
 *   ],
 * }
 * ```
 */
export type Layout =
  | { type: "box" }
  | {
      type: "split";
      direction: "horizontal" | "vertical";
      /** direction: "horizontal" のときのみ有効。vertical は中身の量で自動決定するため無視される */
      sizes?: number[];
      children: Layout[];
    };

type SplitLayout = Extract<Layout, { type: "split" }>;

type BoxEntry<T> = { boxId: string; items: T[] };
type Cursor = { index: number };

type RenderContext<T> = {
  boxes: BoxEntry<T>[];
  cursor: Cursor;
  getId: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  renderBoxTitle?: (boxId: string) => ReactNode;
};

const toDefaultSize = (size: number | undefined): string | undefined =>
  size !== undefined ? `${size}%` : undefined;

const renderBox = <T,>(ctx: RenderContext<T>): ReactNode => {
  const entry = ctx.boxes[ctx.cursor.index];
  if (entry === undefined) {
    throw new Error(`SortableArea: layout expects more boxes than "value" provides`);
  }
  ctx.cursor.index += 1;
  return (
    <SortableBox
      key={entry.boxId}
      boxId={entry.boxId}
      items={entry.items}
      getId={ctx.getId}
      renderItem={ctx.renderItem}
      title={ctx.renderBoxTitle?.(entry.boxId)}
    />
  );
};

// 縦積み（vertical）の入れ物。中身の量に応じて自然に高さが決まる — resizable Panel は使わない。
const renderStack = <T,>(layout: SplitLayout, ctx: RenderContext<T>): ReactNode => (
  <div key={`stack-${ctx.cursor.index}`} className={styles.stack}>
    {layout.children.map((child) => renderStackItem(child, ctx))}
  </div>
);

const renderStackItem = <T,>(layout: Layout, ctx: RenderContext<T>): ReactNode => {
  if (layout.type === "box") {
    return renderBox(ctx);
  }
  return layout.direction === "vertical" ? (
    renderStack(layout, ctx)
  ) : (
    <Group key={`group-${ctx.cursor.index}`} orientation="horizontal" className={styles.group}>
      {renderGroupChildren(layout, ctx)}
    </Group>
  );
};

// 横並び（horizontal）の入れ物。ドラッグでリサイズ可能な react-resizable-panels の Group。
const renderGroupChildren = <T,>(layout: SplitLayout, ctx: RenderContext<T>): ReactNode[] =>
  layout.children.flatMap((child, i) => {
    const separator =
      i > 0 ? <Separator key={`sep-${i}`} className={styles.separator} /> : null;
    const panel = (
      <Panel key={`panel-${ctx.cursor.index}`} defaultSize={toDefaultSize(layout.sizes?.[i])} className={styles.panel}>
        {renderPanelContent(child, ctx)}
      </Panel>
    );
    return separator === null ? [panel] : [separator, panel];
  });

const renderPanelContent = <T,>(layout: Layout, ctx: RenderContext<T>): ReactNode => {
  if (layout.type === "box") {
    return renderBox(ctx);
  }
  return layout.direction === "vertical" ? (
    renderStack(layout, ctx)
  ) : (
    <Group orientation="horizontal" className={styles.group}>
      {renderGroupChildren(layout, ctx)}
    </Group>
  );
};

type RenderLayoutTreeArgs<T> = {
  layout: Layout;
  boxes: BoxEntry<T>[];
  getId: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  renderBoxTitle?: (boxId: string) => ReactNode;
};

export const renderLayoutTree = <T,>({
  layout,
  boxes,
  getId,
  renderItem,
  renderBoxTitle,
}: RenderLayoutTreeArgs<T>): ReactNode => {
  const ctx: RenderContext<T> = { boxes, cursor: { index: 0 }, getId, renderItem, renderBoxTitle };

  if (layout.type === "box") {
    return renderBox(ctx);
  }
  return layout.direction === "vertical" ? (
    renderStack(layout, ctx)
  ) : (
    <Group orientation="horizontal" className={styles.group}>
      {renderGroupChildren(layout, ctx)}
    </Group>
  );
};
