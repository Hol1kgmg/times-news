// よく使うレイアウト形状を box の個数から自動生成するプリセット集。
// value のキー名には依存せず、個数だけを入力として Layout ツリーを組み立てる。

import type { Layout } from "./renderLayoutTree";

/**
 * 1つ目を左半分に縦通し、残りを右側に縦積みするレイアウトを box 数から生成する。
 *
 * @param boxCount value に含まれる box の個数
 */
export const buildLeftFixedLayout = (boxCount: number): Layout => {
  if (boxCount <= 1) {
    return { type: "box" };
  }
  if (boxCount === 2) {
    return {
      type: "split",
      direction: "horizontal",
      children: [{ type: "box" }, { type: "box" }],
    };
  }
  return {
    type: "split",
    direction: "horizontal",
    sizes: [50, 50],
    children: [
      { type: "box" },
      {
        type: "split",
        direction: "vertical",
        children: Array.from({ length: boxCount - 1 }, () => ({ type: "box" }) as const),
      },
    ],
  };
};
