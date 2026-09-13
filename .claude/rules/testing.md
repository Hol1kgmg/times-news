# Unit Test Rules

Full reference: [docs/testing-guide.md](../docs/testing-guide.md)

> **Note**: This file contains only the key rules needed for quick reference.
> Full details and rationale are in the guide above. When in doubt, read the guide.

## Stack

| 項目 | 内容 |
|---|---|
| ランナー | Vitest（`frontend/vitest.config.ts`） |
| 実行環境 | jsdom |
| コンポーネント | `@testing-library/react` |
| ユーザー操作 | `@testing-library/user-event` |
| マッチャ | `@testing-library/jest-dom`（`vitest.setup.ts` で読み込み済み） |
| カバレッジ | `@vitest/coverage-v8` |
| E2E | Playwright（`frontend/e2e/` — ユニットテストとは別管理） |

```bash
pnpm --dir frontend test           # ワンショット実行
pnpm --dir frontend test:watch     # ウォッチ
pnpm --dir frontend test:coverage  # カバレッジ付き
```

`globals: false` のため `describe` / `it` / `expect` / `vi` は **すべて `vitest` から明示的に import する**。

## テスト対象の判断（レイヤー別）

| レイヤー | 対象 | 必須度 |
|---|---|---|
| `shared/lib/` | 純粋関数・変換ロジック | **必須** |
| `entities/*/model/adapters.ts` | Raw → ドメイン型の変換 | **必須** |
| `aggregates/*/model/adapters.ts` | Raw → 集約型の変換 | **必須** |
| `*/model/queryKeys.ts` | キーの一意性・引数反映 | 推奨 |
| `shared/ui/`, `entities/*/ui/` | 表示分岐・条件レンダリングを持つもの | 推奨 |
| `features/` | ユーザー操作とその結果（フォーム・トグル等） | 推奨 |
| `widgets/` | 複合ブロックの結合 | 任意（E2E に委ねてよい） |
| `routes/api/` | BFF ハンドラの入出力・エラー応答 | 任意 |
| `pages/`, `routes/` | — | **不要**（Playwright の担当） |

判断に迷ったら「**そのファイルに条件分岐があるか**」で決める。分岐のない純粋な受け渡しだけのコードはテストしない。

### 書かなくてよいもの

- 型定義のみのファイル（`types.ts`）
- barrel（`index.ts`）
- CSS Modules の適用有無
- ライブラリの挙動そのもの（React の再レンダリング、TanStack Query のキャッシュ機構など）

## ファイル配置と命名

実装ファイルと **同じディレクトリに同じ名前** で配置する（CSS Modules と同じ同位配置の規約）。

```
entities/archive-date/
  model/
    adapters.ts
    adapters.test.ts        ← 隣に置く
    types.ts                ← 型のみなのでテスト不要
  ui/
    NewsItemLink.tsx
    NewsItemLink.module.css
    NewsItemLink.test.tsx
```

| 対象 | 命名 |
|---|---|
| ロジック | `xxx.test.ts` |
| コンポーネント | `Xxx.test.tsx` |

- `__tests__/` ディレクトリは作らない
- `*.spec.ts` は Playwright（`e2e/`）が使うため、ユニットテストでは使わない
- テストファイルからのみ使うフィクスチャは同ディレクトリに `xxx.fixture.ts` として置く

## テストの書き方

### 構造

`describe` は **テスト対象の識別子名** を1つだけ。`it` は日本語で「どうなるか」を書く。

```ts
import { describe, expect, it } from "vitest";

import { isMobileUserAgent } from "./isMobileUserAgent";

describe("isMobileUserAgent", () => {
  it("iPhone の UA に対して true を返す", () => {
    expect(isMobileUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)")).toBe(true);
  });

  it("undefined に対して false を返す", () => {
    expect(isMobileUserAgent(undefined)).toBe(false);
  });
});
```

- `it` の中は **準備 → 実行 → 検証** の順に並べ、空行で区切る
- 1つの `it` で検証するふるまいは1つ
- テスト名に「正常系」「異常系」「テストする」は書かない。入力と期待結果を書く

### 関数定義スタイル

テストコードにも [typescript.md](./typescript.md) の規約が適用される。ヘルパは `const` + アロー関数で定義する。
`describe` / `it` のコールバックは引数として渡すアロー関数なので、この規約と矛盾しない。

### Branded Types の扱い（typescript.md の例外）

[typescript.md](./typescript.md) は `brand<T>()` を `adapters.ts` 限定としているが、
**テストファイルとフィクスチャファイルはこの例外とする**。Branded Type の値を組み立てられないとテストが書けないため。

```ts
// ✅ テストファイル内では許可
const id = brand<NewsItemId>("abc-123");

// ❌ `as` による直接キャストは引き続き禁止
const id = "abc-123" as NewsItemId;
```

`!`（Non-null assertion）はテストコードでも **禁止**。取得できない可能性のある要素は
`getBy*`（見つからなければ throw する）を使って絞り込む。

## Testing Library の使い方

### クエリの優先順位

上から順に検討し、上位で書けるならそれを使う。

| 優先 | クエリ | 用途 |
|---|---|---|
| 1 | `getByRole` | ほぼすべての要素。アクセシビリティも同時に担保できる |
| 2 | `getByLabelText` | フォーム入力 |
| 3 | `getByText` | 表示テキストの確認 |
| 4 | `getByTestId` | 上記で到達できない場合の最終手段 |

- `container.querySelector` と CSS クラス名によるクエリは **禁止**（スタイル変更でテストが壊れる）
- 存在しないことの検証は `queryBy*` + `toBeNull()` / `not.toBeInTheDocument()`
- 非同期に現れる要素は `findBy*` または `waitFor` を使い、固定時間の待機は書かない

### ユーザー操作

`fireEvent` ではなく `user-event` を使う。実際の操作に近いイベント列が再現される。

```tsx
import userEvent from "@testing-library/user-event";

const user = userEvent.setup();
await user.click(screen.getByRole("button", { name: "登録" }));
```

## モックの方針

MSW は未導入のため、BFF 通信のモックは `vi.stubGlobal` で行う。

```ts
import { vi } from "vitest";

vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ dates: [] }))));
```

`vitest.config.ts` で `restoreMocks` / `unstubGlobals` / `unstubEnvs` を有効にしているため、
**各テスト後の後始末は自動**。`afterEach` での手動リストアは書かない。

| 方針 | 内容 |
|---|---|
| ✅ | `fetch` のスタブ、時刻の固定（`vi.useFakeTimers`）、ブラウザAPI（`matchMedia` 等）のスタブ |
| ⚠️ | `vi.mock` によるモジュールモックは、外部I/Oを含むモジュールに限る |
| ❌ | 同じスライス内の自作モジュールをモックする（設計の問題を隠すため） |

## Jotai / TanStack Query

### Jotai

グローバルストアを共有すると **テスト間で状態が漏れる**。テストごとに `createStore()` した
ストアを `Provider` に渡す。詳細は `jotai` skill を参照。

```tsx
import { Provider, createStore } from "jotai";

const store = createStore();
store.set(sidebarOpenAtom, true);

render(<SiteHeader />, {
  wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
});
```

### TanStack Query

`QueryClient` もテストごとに新規作成し、`retry: false` にする（失敗時のリトライでテストが遅くなるため）。

```tsx
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});
```

## 禁止パターン

| # | 禁止 | 代替 |
|---|---|---|
| 1 | 実装の内部状態・プライベート関数へのアサーション | 公開されたふるまい（DOM出力・戻り値）を検証する |
| 2 | CSS クラス名・DOM 構造に依存したクエリ | `getByRole` 等のセマンティックなクエリ |
| 3 | スナップショットテストの常用 | 明示的なアサーション（スナップショットは差分検出目的の限定使用のみ） |
| 4 | `setTimeout` による固定時間待機 | `findBy*` / `waitFor` / `vi.useFakeTimers` |
| 5 | テスト間で共有される可変モジュールスコープ変数 | 各 `it` 内、または `beforeEach` で初期化 |
| 6 | 条件分岐（`if` / `try-catch`）を含むテスト | ケースごとに `it` を分ける |
| 7 | 1つの `it` での複数ふるまいの検証 | `it` を分割する |
| 8 | ライブラリ自体の挙動のテスト | 自コードのロジックのみ検証する |
| 9 | テストを通すための実装側への `export` 追加 | 公開APIを経由して検証する |

## CI

`.github/workflows/frontend-ci.yml` の `test` job で `pnpm --dir frontend test` が実行される。

> **重要**: 現在 `vitest.config.ts` に `passWithNoTests: true` が残っている。
> これはテストが 0 件でも成功扱いになる設定で、**最初のテストを追加した時点で削除する**。
> 残したままだと CI の test job が何も検証しない状態になる。

E2E（Playwright）は CI で実行されていない。ユニットテストが唯一のランタイム検証手段である点に留意する。
