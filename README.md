# tanstack-start-fsd-template

TanStack Start / React 19 / FSD テンプレートリポジトリ

## このリポジトリの目的

本リポジトリは、TanStack Start の活用と、FSD（Feature-Sliced Design）の思想を取り入れた独自アーキテクチャの模索を目的としています。

ディレクトリ構造がただ一つに定まる形で明示されたアーキテクチャを理想として、実装者による判断のばらつきやレビューコスト、暗黙の依存関係の発生を防ぐことを目指しています。詳細は [docs/layer-architecture-guide.md](./docs/layer-architecture-guide.md) を参照してください。

なお、リポジトリには汎用サンプル機能（サンプル相性診断）が `/sample/match` に含まれています。外部APIには依存せずテンプレート内で完結しており、各 FSD レイヤー（entities / features / widgets / pages / routes/api）の実装例として参照してください。`sample-` の付くスライスは実アプリ構築時にまとめて削除できます。トップページ（`/`）はテンプレートのプレースホルダーです。

## 前提条件

[Nix](https://nixos.org/) と [direnv](https://direnv.net/) がインストールされ、シェルに統合されていること。また [devenv](https://devenv.sh/) を導入していること。

Nix (flakes有効化を含むインストーラ推奨):

```bash
sh <(curl -L https://nixos.org/nix/install)
```

devenv:

```bash
nix profile install --accept-flake-config https://install.devenv.sh/latest
```

direnv (macOS / Homebrew):

```bash
brew install direnv
```

シェル統合 (zsh):

```bash
echo 'eval "$(direnv hook zsh)"' >> ~/.zshrc
source ~/.zshrc
```

## セットアップ

### 1. direnv を許可してツール環境を有効化

```bash
direnv allow
```

初回はNix/devenvの環境構築が走ります。Node / pnpm / gitleaks / actionlint / ghalint / pinact / just が自動で用意されます。以降はディレクトリに入ると自動でシェルが有効化されます。

> **Note**: `direnv` はシェルフックが次のプロンプト描画時に環境を再読込する仕組みのため、対話シェルで1コマンドずつ実行する分には `direnv allow` 直後から `just` 等が使えます。スクリプトの一括実行やCIなど非対話シェルで同一プロセス内に反映させたい場合は、`direnv exec . <command>`（例: `direnv exec . just install`）を使ってください。

### 2. 依存パッケージのインストール

```bash
just install
```

`pnpm install` 実行時に `lefthook install` が自動で走り、Git フックが設定されます。

### 3. 開発サーバーの起動

```bash
just dev
```

`http://localhost:3000` でアクセスできます。

## 開発コマンド

利用可能なコマンドの一覧は `just --list` で確認できます。

| コマンド | 説明 |
|---|---|
| `just install` | 依存パッケージのインストール |
| `just dev` | 開発サーバー起動 |
| `just build` | プロダクションビルド |
| `just preview` | ビルド成果物のプレビュー |
| `just typecheck` | TypeScript 型チェック |
| `just lint` | リンター |
| `just format` | コードフォーマット |
| `just test` | ユニットテスト |
| `just test-e2e` | E2E テスト |

追加の引数はそのまま後ろに渡せます（例: `just dev --port 3001`）。

## コミット時の自動チェック

`git commit` 時に lefthook が以下を自動実行します。問題があれば自動修正した上でコミットされます。

| チェック | ツール | 自動修正 |
|---|---|---|
| シークレットスキャン | gitleaks | なし（検出時はコミット中断） |
| Lint | oxlint | あり |
| フォーマット | oxfmt | あり |
| マークアップ | markuplint | あり |
| 型チェック | tsc | なし（エラー時はコミット中断） |
