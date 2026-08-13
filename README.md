# tanstack-start-fsd-template

TanStack Start / React 19 / FSD テンプレートリポジトリ

## このリポジトリの目的

本リポジトリは、TanStack Start の活用と、FSD（Feature-Sliced Design）の思想を取り入れた独自アーキテクチャの模索を目的としています。

ディレクトリ構造がただ一つに定まる形で明示されたアーキテクチャを理想として、実装者による判断のばらつきやレビューコスト、暗黙の依存関係の発生を防ぐことを目指しています。詳細は [docs/layer-architecture-guide.md](./docs/layer-architecture-guide.md) を参照してください。

なお、リポジトリには汎用サンプル機能（サンプル相性診断）が `/sample/match` に含まれています。外部APIには依存せずテンプレート内で完結しており、各 FSD レイヤー（entities / features / widgets / pages / routes/api）の実装例として参照してください。`sample-` の付くスライスは実アプリ構築時にまとめて削除できます。トップページ（`/`）はテンプレートのプレースホルダーです。

## 前提条件

[mise](https://mise.jdx.dev/) がインストールされ、シェルに統合されていること。

macOS (Homebrew):

```bash
brew install mise
```

シェル統合 (zsh):

```bash
echo 'eval "$(mise activate zsh)"' >> ~/.zshrc
source ~/.zshrc
```

## セットアップ

### 1. mise でツールバージョンを固定

```bash
mise trust && mise install
```

Node / pnpm / gitleaks が自動でインストールされます。

### 2. 依存パッケージのインストール

```bash
mise run install
```

`pnpm install` 実行時に `lefthook install` が自動で走り、Git フックが設定されます。

### 3. 開発サーバーの起動

```bash
mise run dev
```

`http://localhost:3000` でアクセスできます。

## 開発コマンド

利用可能なコマンドの一覧は `mise tasks` で確認できます。

| コマンド | 説明 |
|---|---|
| `mise run install` | 依存パッケージのインストール |
| `mise run dev` | 開発サーバー起動 |
| `mise run build` | プロダクションビルド |
| `mise run preview` | ビルド成果物のプレビュー |
| `mise run typecheck` | TypeScript 型チェック |
| `mise run lint` | リンター |
| `mise run format` | コードフォーマット |
| `mise run test` | ユニットテスト |
| `mise run test:e2e` | E2E テスト |

オプションは `--` の後に渡します（例: `mise run dev -- --port 3001`）。

## コミット時の自動チェック

`git commit` 時に lefthook が以下を自動実行します。問題があれば自動修正した上でコミットされます。

| チェック | ツール | 自動修正 |
|---|---|---|
| シークレットスキャン | gitleaks | なし（検出時はコミット中断） |
| Lint | oxlint | あり |
| フォーマット | oxfmt | あり |
| マークアップ | markuplint | あり |
| 型チェック | tsc | なし（エラー時はコミット中断） |
