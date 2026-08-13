# 技術スタック

TanStack Start / React 19 / FSD テンプレートリポジトリのフロントエンド技術スタック一覧。

---

## ランタイム・パッケージマネージャー

| ツール | バージョン | 備考 |
|---|---|---|
| Node.js | 24.15.0 | mise で管理（`mise.toml`） |
| pnpm | 11.4.0 | mise で管理（`mise.toml`） |

---

## フレームワーク・コアライブラリ

| ライブラリ | バージョン | 用途 |
|---|---|---|
| React | 19.2.7 | UI フレームワーク |
| TanStack Start | 1.168.22 | SSR フレームワーク（Server Functions） |
| TanStack Router | 1.170.13 | ファイルベースルーティング |
| TypeScript | 6.0.3 | 型システム |
| Vite | 8.0.16 | ビルドツール |

---

## 状態管理・データ取得

| ライブラリ | バージョン | 用途 |
|---|---|---|
| jotai | 2.20.0 | クライアント状態管理（atom） |
| TanStack Query | 5.101.2 | サーバー状態管理（useQuery・キャッシュ）。`@tanstack/react-router-ssr-query` で Router と SSR 統合 |

---

## UI

| ライブラリ | バージョン | 用途 |
|---|---|---|
| lucide-react | 0.545.0 | アイコン |
| react-select | 5.10.2 | セレクトボックス |

### スタイリング

- **CSS Modules**（Vite ネイティブサポート、追加設定不要）
- コンポーネントと同ディレクトリ・同名で `*.module.css` を配置
- グローバルスタイル（リセット・ベース）は `src/styles.css` のみ

---

## 静的解析・フォーマット

| ツール | バージョン | 用途 |
|---|---|---|
| oxlint | ^1.68.0 | Linter（Rust 製） |
| oxfmt | ^0.53.0 | Formatter（Rust 製） |
| markuplint | 4.18.3 | JSX/TSX のマークアップルールチェック |
| lefthook | ^2.1.9 | Git フック管理（pre-commit） |

### pre-commit フック（`lefthook.yml`）

コミット時に以下を並列実行し、自動修正後にステージングまで行う。

| コマンド | ツール | 対象 | 自動修正 |
|---|---|---|---|
| `lint-code` | oxlint | `src/**/*.{ts,tsx}` | あり |
| `format-code` | oxfmt | `src/**/*.{ts,tsx,js,jsx}` | あり |
| `lint-markup` | markuplint | `src/**/*.tsx` | あり |
| `typecheck` | tsc | プロジェクト全体 | なし（エラー時はコミット中断） |

---

## テスト

| ライブラリ | バージョン | 用途 |
|---|---|---|
| vitest | 4.1.8 | テストランナー（jsdom 環境） |
| @testing-library/react | 16.3.2 | React コンポーネントテスト |
| @testing-library/dom | 10.4.1 | DOM ユーティリティ |
| jsdom | 28.1.0 | ブラウザ環境エミュレーション |

---

## アーキテクチャ

FSD（Feature-Sliced Design）を採用。レイヤー依存は一方通行。

```
app(routes) → pages → widgets → features → aggregates → entities → shared
```

詳細は [layer-architecture-guide.md](./layer-architecture-guide.md) を参照。

---

## TypeScript 設定概要（`tsconfig.json`）

| オプション | 値 |
|---|---|
| `target` | ES2022 |
| `moduleResolution` | bundler |
| `strict` | true |
| `noUnusedLocals` / `noUnusedParameters` | true |
| パスエイリアス | `#/*`, `@/*` → `./src/*` |
