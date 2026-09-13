# ユニットテストガイド

クイックリファレンス: [.claude/rules/testing.md](../.claude/rules/testing.md)

このガイドはルールの **根拠** と、このリポジトリの実コードを題材にした記述例をまとめる。
ルールだけで判断できる場合はここを読む必要はない。

---

## 1. 何をテストするかの考え方

### 基準は「条件分岐があるか」

テストの価値は「壊れたときに気付けること」にある。分岐のないコードは壊れ方が型チェックで
検出できる範囲に収まるため、テストを書いてもコストに見合わない。

```ts
// frontend/src/entities/archive-date/model/adapters.ts
export const toArchiveDate = (raw: string): ArchiveDate => brand<ArchiveDate>(raw);
```

これは分岐がなく `brand` を通すだけなので、単体では **テスト不要**。
一方、次のように検証や整形が入った時点でテスト対象になる。

```ts
export const toArchiveDate = (raw: string): ArchiveDate => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    throw new Error(`不正な日付形式: ${raw}`);
  }
  return brand<ArchiveDate>(raw);
};
```

### レイヤーごとの必須度の根拠

| レイヤー | 必須度の理由 |
|---|---|
| `shared/lib/` | 依存がなく入出力が閉じているため、テストが最も安く最も効く |
| `*/model/adapters.ts` | BFF レスポンスという **外部由来の構造** を内部型に変換する境界。外部の変更が最初に露呈する場所 |
| `*/model/queryKeys.ts` | キーの衝突はキャッシュの取り違えとして現れ、型では検出できない |
| `ui/` | 表示分岐はデグレが起きやすく、かつ `getByRole` で安く書ける |
| `features/` | ユーザー操作の結果は仕様そのもの |
| `widgets/` | 結合度が高くテストが壊れやすい。E2E の方が費用対効果が高い場合が多い |
| `pages/` / `routes/` | 組み立てのみで固有ロジックを持たない（アーキテクチャ規約上そうなっている） |

`pages/` がテスト不要なのは [architecture.md](../.claude/rules/architecture.md) が
「`page.tsx` はウィジェットを組み立てるだけ、ビジネスロジック・カスタムフック禁止」と
定めているため。ロジックがないものはテストできない。

---

## 2. 同位配置を採る理由

FSD ではスライスが凝集の単位であり、スライスごと移動・削除されることが前提になっている
（[workflow.md](../.claude/rules/workflow.md) の Phase 2 の「振り分け」はまさにこの移動を指す）。

テストを `__tests__/` や `test/` に分離すると、スライスを移動するたびに2箇所を直す必要が生じ、
移動漏れでテストが孤立する。同位配置ならディレクトリごと動かすだけで済む。

これは CSS Modules を「同じディレクトリに同じ名前」で置く
[styling.md](../.claude/rules/styling.md) の規約と同じ判断基準による。

```
widgets/daily-archive-box/
  DailyArchiveBox.tsx
  DailyArchiveBox.module.css
  DailyArchiveList.tsx
  useArchiveDisplayLimit.ts
  useArchiveDisplayLimit.test.ts   ← このスライスごと移動できる
  index.ts
```

### カバレッジ設定との関係

同位配置ではテストファイルが `src/` 配下に入るため、カバレッジ計測から明示的に除外している。

```ts
// frontend/vitest.config.ts
coverage: {
  include: ['src/**/*.{ts,tsx}'],
  exclude: [
    'src/**/*.{test,spec}.{ts,tsx}',   // テスト自身
    'src/**/index.{ts,tsx}',           // barrel（再export のみ）
    'src/routeTree.gen.ts',            // 自動生成
    'src/**/*.d.ts',
  ],
}
```

---

## 3. Branded Types を例外とした理由

[typescript.md](../.claude/rules/typescript.md) は `brand<T>()` の呼び出しを `adapters.ts` に
限定している。これは「ブランド付けはBFF境界の変換時に一度だけ行う」という設計意図による。

しかしテストでは、変換後の値を **入力として** 用意する必要がある。

```ts
// entities/news-item/ui/NewsItemLink.test.tsx
// Props は Branded Type を要求するため、brand() なしでは呼び出せない
type Props = { newsItemId: NewsItemId };
```

ここで `as NewsItemId` を許すと、本番コードでの `as` 禁止が形骸化する。
`brand<T>()` に限って許可することで、**ブランド付けの経路を1つに保ったまま** テストを書ける。

```ts
// ✅ テストファイル・フィクスチャファイルでのみ許可
import { brand } from "#/shared/lib/branded";

const newsItemId = brand<NewsItemId>("abc-123");

// ❌ 本番コードと同様に禁止
const newsItemId = "abc-123" as NewsItemId;
```

フィクスチャが複数のテストから使われる場合は `xxx.fixture.ts` に切り出す。

```ts
// entities/news-item/model/newsItem.fixture.ts
import { brand } from "#/shared/lib/branded";

import type { NewsItem, NewsItemId } from "./types";

export const createNewsItem = (overrides: Partial<NewsItem> = {}): NewsItem => ({
  id: brand<NewsItemId>("news-1"),
  title: brand<NewsItemTitle>("サンプル記事"),
  ...overrides,
});
```

`overrides` を受け取る形にしておくと、テストごとに関心のあるフィールドだけを指定できる。

---

## 4. クエリの優先順位の根拠

`getByRole` を最優先にするのは、**アクセシビリティの担保とテストの安定性が同時に得られる**ため。

```tsx
// ❌ クラス名は見た目の都合で変わる。変更のたびにテストが壊れる
container.querySelector(".submitButton");

// ❌ テキストは文言調整で変わりやすい
screen.getByText("登録");

// ✅ role と アクセシブルネームは「そのボタンが何であるか」を表す
screen.getByRole("button", { name: "登録" });
```

`getByRole` で取得できない場合、多くは **マークアップ側に問題がある**（`button` ではなく
`div` に `onClick` を付けている、ラベルのない入力欄など）。テストが書きにくいことを
実装を見直す契機として扱う。このリポジトリは `oxlint` の `jsx-a11y` プラグインと
`markuplint` を導入済みなので、そちらの指摘とも整合する。

`getByTestId` は最終手段。使う場合は「なぜ他のクエリで到達できないか」をコメントに残す。

---

## 5. 非同期の扱い

固定時間の待機は、遅いCI環境で偶発的に失敗し（flaky）、速い環境では無駄に遅い。

```ts
// ❌ 環境によって壊れる
await new Promise((resolve) => setTimeout(resolve, 100));
expect(screen.getByText("読み込み完了")).toBeInTheDocument();

// ✅ 条件が満たされるまで待つ
expect(await screen.findByText("読み込み完了")).toBeInTheDocument();
```

`findBy*` は内部で `waitFor` を使い、デフォルト1秒までポーリングする。
DOM に現れないものを待つ場合（状態変数など）は `waitFor` を直接使う。

タイマーに依存するロジック（デバウンス等）は `vi.useFakeTimers()` で時間を制御する。
`user-event` と併用する場合は `advanceTimers` の指定が必要になる。

```ts
const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
```

---

## 6. モックの方針と MSW 不在について

`docs/test-stack.md` は以前 MSW の利用を前提に記述していたが、**MSW は導入されていない**。
BFF 通信のモックは `vi.stubGlobal` で行う。

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("useArchiveDates", () => {
  it("BFF のレスポンスを ArchiveDate[] に変換する", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify(["2026-09-01", "2026-09-02"]))),
    );

    // ...
  });
});
```

`vitest.config.ts` で次を有効にしているため、後始末は自動で行われる。

| 設定 | 効果 |
|---|---|
| `restoreMocks: true` | 各テスト後に `vi.fn` / `vi.spyOn` を元に戻す |
| `unstubGlobals: true` | 各テスト後に `vi.stubGlobal` を解除する |
| `unstubEnvs: true` | 各テスト後に `vi.stubEnv` を解除する |

そのため `afterEach(() => vi.restoreAllMocks())` のような記述は **書かない**（二重管理になる）。

### 自作モジュールをモックしない理由

同じスライス内のモジュールを `vi.mock` で差し替えると、テストは通るが結合部分の破綻を
検出できなくなる。モックしたくなった場合、多くは依存の向きか責務分割の問題なので、
[architecture.md](../.claude/rules/architecture.md) の配置基準を見直す。

外部I/O（`fetch`、`localStorage`、日付）だけを境界でスタブするのが原則。

---

## 7. Jotai のテスト

Jotai のデフォルトストアはモジュールスコープのシングルトンで、テストファイル内の
全テストで共有される。片方のテストで `set` した値が次のテストに漏れる。

```tsx
import { Provider, createStore } from "jotai";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { sidebarOpenAtom } from "#/shared/state/sidebarOpenAtom";

describe("SiteHeader", () => {
  it("サイドバーが開いているとき閉じるボタンを表示する", () => {
    const store = createStore();
    store.set(sidebarOpenAtom, true);

    render(
      <Provider store={store}>
        <SiteHeader />
      </Provider>,
    );

    expect(screen.getByRole("button", { name: "サイドバーを閉じる" })).toBeInTheDocument();
  });
});
```

各テストで `createStore()` を呼ぶことで隔離される。`beforeEach` で生成してもよいが、
テストごとに初期値が異なることが多いため `it` 内での生成を推奨する。

なお jotai は v3 に更新済みで、`atomFamily` / `loadable` / `setSelf` / `jotai/babel` は
削除されている。テストでこれらを使わないこと。詳細は `jotai` skill を参照。

---

## 8. TanStack Query のテスト

`QueryClient` もテストごとに新規作成する。既定のリトライはテストを無駄に遅くするため無効にする。

```tsx
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
```

`entities/*/useXxx.ts` や `features/*/useXxx.ts` のようなフックを直接テストする場合は
`renderHook` を使う。

```tsx
import { renderHook, waitFor } from "@testing-library/react";

const { result } = renderHook(() => useArchiveDates(), {
  wrapper: ({ children }) => (
    <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>
  ),
});

await waitFor(() => {
  expect(result.current.isSuccess).toBe(true);
});
```

---

## 9. ユニットテストと E2E の棲み分け

| 観点 | ユニット（Vitest） | E2E（Playwright） |
|---|---|---|
| 変換・計算ロジック | ✅ | ❌ |
| 単一コンポーネントの表示分岐 | ✅ | ❌ |
| ユーザー操作に対する局所的な反応 | ✅ | △ |
| 画面遷移・ルーティング | ❌ | ✅ |
| 認証フロー（GitHub OAuth 等） | ❌ | ✅ |
| 複数ウィジェットをまたぐ動線 | △ | ✅ |
| 実ブラウザ固有の挙動 | ❌ | ✅ |

現時点で **E2E は CI で実行されていない**（`.github/workflows/frontend-ci.yml` のジョブは
`typecheck` / `lint` / `test` のみ）。したがって CI が守ってくれる範囲はユニットテストが
カバーした部分のみである点に注意する。

---

## 10. `passWithNoTests` について

`frontend/vitest.config.ts` には現在 `passWithNoTests: true` が入っている。
これはテストが 0 件でも `vitest run` が exit 0 になる設定である。

2026-09-13 時点でユニットテストは 1 件も存在せず、この設定により CI の `test` job は
常に成功していた。vitest 5 / jotai 3 への major 更新時に「CI の test が通っている」ことを
安全性の根拠として扱いかけたが、実際には何も検証していなかった。

**最初のテストを追加した時点でこの設定を削除すること。** 削除すれば、テストファイルが
誤って全滅した場合に CI が検知できるようになる。
