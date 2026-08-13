# ドキュメント一覧

TanStack Start / React 19 / FSD テンプレートリポジトリの設計・実装ドキュメント。

---

## サンプル実装仕様

| ドキュメント | 内容 |
|---|---|
| [sample-spec.md](./sample-spec.md) | サンプル実装（サンプル相性診断機能）の画面構成・API仕様・相性計算ロジック |

---

## アーキテクチャ・実装ガイド

| ドキュメント | 内容 |
|---|---|
| [layer-architecture-guide.md](./layer-architecture-guide.md) | FSD（Feature-Sliced Design）レイヤー設計・依存ルール・ディレクトリ構成（完成形の基準） |
| [implementation-workflow-guide.md](./implementation-workflow-guide.md) | 2フェーズ構成の実装手法（widgets 仮実装 → 指示駆動で振り分け） |
| [tanstack-start-guide.md](./tanstack-start-guide.md) | TanStack Start での Read / Mutation / Provider の実装例 |
| [state-management-guide.md](./state-management-guide.md) | Jotai の atom 配置ルールと Provider の配置場所 |
| [styling-guide.md](./styling-guide.md) | CSS Modules の基本ルールとファイル配置規則 |
| [coding-guide.md](./coding-guide.md) | 型・アーキテクチャ・コンポーネント・命名規則の逆引きリファレンス |

---

## 技術スタック・ツール

| ドキュメント | 内容 |
|---|---|
| [tech-stack.md](./tech-stack.md) | フレームワーク・ライブラリ・ツールのバージョン一覧（静的解析・フォーマット含む） |
| [test-stack.md](./test-stack.md) | Vitest / Playwright / Storybook のテスト構成詳細 |
