"use client";

// SortableArea の box 配置を、value の中身（キー名）に依存せず
// 「方向・エリアごとのbox個数」だけで宣言的（JSON形式）に指定して要素へ変換する。
//
// - direction: "horizontal" … react-resizable-panels でドラッグリサイズ可能な分割にする
// - direction: "vertical"   … 素の flexbox で縦に積む（中身の量に応じて高さが自動で伸び、
//   スクロールもリサイズハンドルも持たない）

import type { ReactNode } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { SortableBox } from "./SortableBox";
import styles from "./SortableArea.module.css";

/**
 * box の分割構成を「方向」と「エリアごとの box 個数」だけで指定するための設定。
 * `areas` の出現順が `Object.entries(value)` の出現順に対応する。
 *
 * - `count` を省略したエリアには、その時点で残っている box を全て割り当てる
 * - 1エリアに複数 box が割り当てられ、かつ `layout`（ネスト指定）が無い場合は縦積みにする
 * - `size` は `direction: "horizontal"` のときのみ有効（vertical は中身の量で自動決定するため無視される）
 *
 * @example 左を1個・右に残り全部を縦積み（左右はドラッグでリサイズ可能）
 * ```
 * {
 *   direction: "horizontal",
 *   areas: [
 *     { count: 1, size: 50 },
 *     { layout: { direction: "vertical", areas: [{}] } },
 *   ],
 * }
 * ```
 */
export type LayoutArea = {
  /** このエリアに割り当てる box 数。省略時は残っている box を全て割り当てる */
  count?: number;
  /** direction: "horizontal" のときのみ有効な % サイズ */
  size?: number;
  /** このエリア内部をさらに分割する場合のネストレイアウト */
  layout?: Layout;
};

export type Layout = {
  direction: "horizontal" | "vertical";
  areas: LayoutArea[];
};

type BoxEntry<T> = { boxId: string; items: T[] };

type RenderContext<T> = {
  getId: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  renderBoxTitle?: (boxId: string) => ReactNode;
};

const toDefaultSize = (size: number | undefined): string | undefined =>
  size !== undefined ? `${size}%` : undefined;

const renderBoxEntry = <T,>(entry: BoxEntry<T>, ctx: RenderContext<T>): ReactNode => (
  <SortableBox
    key={entry.boxId}
    boxId={entry.boxId}
    items={entry.items}
    getId={ctx.getId}
    renderItem={ctx.renderItem}
    title={ctx.renderBoxTitle?.(entry.boxId)}
  />
);

// 縦積み（vertical）の入れ物。中身の量に応じて自然に高さが決まる — resizable Panel は使わない。
const renderVerticalStack = <T,>(boxes: BoxEntry<T>[], ctx: RenderContext<T>, key: string): ReactNode => (
  <div key={key} className={styles.stack}>
    {boxes.map((entry) => renderBoxEntry(entry, ctx))}
  </div>
);

const renderAreaContent = <T,>(
  area: LayoutArea,
  boxes: BoxEntry<T>[],
  ctx: RenderContext<T>,
  key: string,
): ReactNode => {
  if (area.layout !== undefined) {
    return renderLayoutNode(area.layout, boxes, ctx, key);
  }
  if (boxes.length === 1) {
    const entry = boxes[0];
    if (entry === undefined) {
      throw new Error("SortableArea: layout area expects at least 1 box");
    }
    return renderBoxEntry(entry, ctx);
  }
  return renderVerticalStack(boxes, ctx, key);
};

// layout.areas の順に、残っている box を先頭から割り当てていく。
// count 省略のエリアは、その時点の残り全部を受け取る。
const splitBoxesByAreas = <T,>(areas: LayoutArea[], boxes: BoxEntry<T>[]): BoxEntry<T>[][] => {
  const remaining = [...boxes];
  return areas.map((area) => {
    if (area.count !== undefined && area.count > remaining.length) {
      throw new Error(`SortableArea: layout expects more boxes than "value" provides`);
    }
    return area.count === undefined ? remaining.splice(0, remaining.length) : remaining.splice(0, area.count);
  });
};

const renderLayoutNode = <T,>(
  layout: Layout,
  boxes: BoxEntry<T>[],
  ctx: RenderContext<T>,
  key: string,
): ReactNode => {
  const parts = splitBoxesByAreas(layout.areas, boxes);

  if (layout.direction === "vertical") {
    return (
      <div key={key} className={styles.stack}>
        {layout.areas.map((area, i) => renderAreaContent(area, parts[i] ?? [], ctx, `${key}-${i}`))}
      </div>
    );
  }

  return (
    <Group key={key} orientation="horizontal" className={styles.group}>
      {layout.areas.flatMap((area, i) => {
        const separator = i > 0 ? <Separator key={`${key}-sep-${i}`} className={styles.separator} /> : null;
        const panel = (
          <Panel key={`${key}-panel-${i}`} defaultSize={toDefaultSize(area.size)} className={styles.panel}>
            {renderAreaContent(area, parts[i] ?? [], ctx, `${key}-${i}`)}
          </Panel>
        );
        return separator === null ? [panel] : [separator, panel];
      })}
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
  const ctx: RenderContext<T> = { getId, renderItem, renderBoxTitle };
  return renderLayoutNode(layout, boxes, ctx, "root");
};
