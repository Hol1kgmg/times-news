# テスト・チェック技術スタック

> **Note**: ここでは「何が入っているか」のみを扱う。テストの書き方・配置・判断基準は
> [.claude/rules/testing.md](../.claude/rules/testing.md) と
> [docs/testing-guide.md](./testing-guide.md) を参照。

---

## ユニット / コンポーネントテスト

### Vitest

テストランナー。設定は `frontend/vitest.config.ts`（ビルド用の `vite.config.ts` とは別ファイル）。

| 項目 | 内容 |
|---|---|
| バージョン | 5.0.0 |
| 実行環境 | jsdom（ブラウザ環境エミュレーション） |
| 対象ファイル | `src/**/*.{test,spec}.{ts,tsx}`（実装ファイルと同位配置） |
| setup | `frontend/vitest.setup.ts`（jest-dom マッチャ登録、`cleanup`） |
| globals | `false`（`describe` / `it` / `expect` / `vi` は明示 import） |

```bash
pnpm test           # vitest run（ワンショット実行）
pnpm test:watch     # ウォッチモード
pnpm test:coverage  # カバレッジ付き実行
```

> **⚠️ 現状**: ユニットテストは 1 件も存在せず、`passWithNoTests: true` により
> `vitest run` は常に成功する。CI の `test` job は実質的に何も検証していない。
> 最初のテスト追加時に `passWithNoTests` を削除すること。

### @testing-library/react

React コンポーネントをユーザー操作視点でテストするためのユーティリティ。

| 項目 | 内容 |
|---|---|
| バージョン | 16.3.3 |
| 用途 | コンポーネントのレンダリング・イベント操作・アサーション |

### @testing-library/dom

DOM 操作ユーティリティ。`@testing-library/react` の依存として利用される。

| 項目 | 内容 |
|---|---|
| バージョン | 10.4.1 |
| 用途 | DOM クエリ・アサーション |

### @testing-library/user-event

実ユーザーに近いイベント列を再現する操作ユーティリティ。`fireEvent` の代わりに使う。

| 項目 | 内容 |
|---|---|
| バージョン | 14.6.7 |
| 用途 | クリック・入力・キーボード操作 |

### @testing-library/jest-dom

DOM 向けのカスタムマッチャ（`toBeInTheDocument` 等）。`vitest.setup.ts` で
`@testing-library/jest-dom/vitest` を import 済みのため、各テストでの読み込みは不要。

| 項目 | 内容 |
|---|---|
| バージョン | 7.0.1 |

### @vitest/coverage-v8

カバレッジ計測（V8 プロバイダ）。テストファイル・barrel・自動生成ファイルは計測対象外。

| 項目 | 内容 |
|---|---|
| バージョン | 5.0.0（vitest 本体とメジャーを揃える必要がある） |
| レポーター | `text`, `html` |

### 未導入のもの

以下は **導入されていない**。必要になった時点で検討する。

| ツール | 用途 | 現状の代替 |
|---|---|---|
| MSW | APIモック | `vi.stubGlobal("fetch", ...)` |
| Storybook | コンポーネントカタログ | なし |
| `@storybook/addon-vitest` | Storybook と Vitest の統合 | なし |
| Chromatic | ビジュアルリグレッション | なし |

---

## E2E テスト

### Playwright

エンドツーエンドテスト。`playwright.config.ts` にて設定。

- **対象ディレクトリ**: `e2e/`
- **ブラウザ**: Chromium のみ（`devices['Desktop Chrome']`）
- **レポーター**: HTML形式
- **開発サーバー**: テスト実行時に `pnpm dev` を自動起動（`baseURL: http://localhost:3000`）

CI 環境での挙動:

| 設定項目 | ローカル | CI |
|---|---|---|
| `retries` | 0 | 2 |
| `workers` | 無制限 | 1 |
| `forbidOnly` | false | true |
| `reuseExistingServer` | true | false |

```bash
pnpm test:e2e       # E2E実行
pnpm test:e2e:ui    # Playwright UIモードで実行
```

---

## コンポーネントカタログ

**未導入。** 以前このドキュメントには Storybook 10（`@storybook/react-vite`）と
各種アドオンの記述があったが、実際には `package.json` に含まれていなかったため削除した。
導入する場合は [testing-guide.md](./testing-guide.md) のモック方針との整合を確認すること。

---

## 型チェック

### TypeScript 6

- **主要オプション**:
  - `target: ES2022`
  - `moduleResolution: bundler`
  - `strict: true`
  - `noUnusedLocals / noUnusedParameters: true`
  - `noEmit: true`（型チェック専用、トランスパイルは行わない）
- **パスエイリアス**: `#/*`, `@/*` → `./src/*`

```bash
pnpm typecheck    # tsc --noEmit
```

---

## アクセシビリティチェック

| ツール | タイミング | 内容 |
|---|---|---|
| `oxlint` の `jsx-a11y` プラグイン | lint時（静的解析） | JSX/TSX内のARIA属性・alt等をルールチェック |
| `markuplint` | `pnpm lint:markup` | マークアップの妥当性検証 |
| `@testing-library` の `getByRole` | テスト実行時 | ロール・アクセシブルネームで要素を引けるかが実質的なa11yチェックになる |

---

## まとめ

```
テスト種別              ツール                                実行タイミング
─────────────────────────────────────────────────────────────────────────
ユニット/コンポーネント   Vitest + @testing-library/react       開発中 / CI
カバレッジ              @vitest/coverage-v8                   手動
E2E                    Playwright                            手動のみ（CI未実行）
型チェック              TypeScript (tsc --noEmit)              開発中 / CI
Lint                   oxlint + eslint                       開発中 / CI
アクセシビリティ          jsx-a11y / markuplint                 lint時
APIモック               vi.stubGlobal（MSW未導入）              テスト実行時
```

### CI で実行されるもの

`.github/workflows/frontend-ci.yml` のジョブは `typecheck` / `lint` / `test` の3つ。
E2E は含まれていないため、**CI が守る範囲はユニットテストのカバー範囲に等しい**。
