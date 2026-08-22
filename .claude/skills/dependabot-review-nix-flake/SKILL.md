---
name: dependabot-review-nix-flake
description: dependabot-reviewから委譲される、nix ecosystem（flake.lock: nixpkgs/devenv/flake-utils）向けのバージョン差分判定sub-skill。flake.lockはrevハッシュの差分しか見えずsemver判定ができないため、nix evalでPR前後のdevenv.nix管理パッケージの実バージョンを解決して比較する。単独では呼び出さない。
allowed-tools: Bash(gh pr view:*), Bash(gh pr diff:*), Bash(nix eval:*), Bash(nix --version), Read
---

# dependabot-review-nix-flake — nix flake.lock のバージョン差分判定

[[dependabot-review]] から `nix` ecosystem のPR番号を渡されて呼び出される。単独では使わない。

## なぜ semver 判定ができないか

`nixpkgs` は `ref: rolling`（日付ベースのコミットハッシュ）で追従しており、`devenv` / `flake-utils` も同様にタグなしのコミット追従。dependabotのPRタイトルは `bump nixpkgs from <hash> to <hash>` のような形式になり、`bump X from A to B` をsemverとして比較する [[dependabot-review-semver]] のロジックは使えない。`gh pr diff` で見える `flake.lock` の差分も rev/narHash のハッシュ変化だけで、実際にどのツールがいくつからいくつに動いたかは分からない。そのため `nix eval` で実バージョンを解決して比較する。

## 手順

### 1. 変化したinputの特定

```
gh pr diff <番号> -- flake.lock
```
差分の中で `locked.rev` が変わっているinput（`nixpkgs` / `devenv` / `flake-utils` のいずれか、複数の場合もある）を特定し、旧rev・新revの値を控える。

### 2. 実行systemの確認

```
nix eval --impure --expr 'builtins.currentSystem'
```
以降のバージョン解決に使う `<system>`（例: `aarch64-darwin`, `x86_64-linux`）として使う。

### 3. `nixpkgs` が変化している場合: devenv.nix管理パッケージのバージョン比較

`devenv.nix` の `packages` に列挙されている各属性について、旧rev・新revそれぞれで `nixpkgs.legacyPackages.<system>.<attr>.version` を解決する。

```
nix eval --raw "github:cachix/devenv-nixpkgs/<OLD_REV>#legacyPackages.<system>.nodejs_24.version"
nix eval --raw "github:cachix/devenv-nixpkgs/<NEW_REV>#legacyPackages.<system>.nodejs_24.version"
```

対象属性: `nodejs_24`, `gitleaks`, `actionlint`, `ghalint`, `pinact`, `just`, `gh`, `gh-stack`（`devenv.nix` に追加/削除があれば追随する）。

- 各パッケージについて旧→新のバージョンを一覧化する（変化なしのパッケージも「変化なし」として明記する）
- 解決に失敗した属性（nixpkgsの属性パスがリネームされた等）は「属性解決失敗」として要確認扱いにする

### 4. `devenv` / `flake-utils` が変化している場合

- `devenv` input が変わっている場合: `nix eval` によるバージョン解決だけでは devenv 自体のモジュールAPI変更（`languages.javascript`, `packages`, `enterShell` などのスキーマ）を検知できない。`gh pr view <番号> --json body` の内容と、`https://github.com/cachix/devenv/releases`（新旧revの間のタグ）を確認し、breaking changesの言及がないか確認する
- `flake-utils` が変わっている場合: 変更頻度が低く影響範囲も薄いため、CI成功・コンフリクトなしであれば追加確認は不要

### 5. 判定基準

| 判定 | 条件 |
|---|---|
| ✅ マージ推奨 | CI全て成功 かつ コンフリクトなし かつ `nodejs_24`/`gh`/`gh-stack`/`devenv` に変化なし（`gitleaks`/`actionlint`/`ghalint`/`pinact`/`just`/`flake-utils` のみの変化） |
| ⚠️ 要確認 | `nodejs_24` のバージョンが変化／`gh` または `gh-stack` のバージョンが変化／`devenv` input が変化／属性解決失敗、のいずれかに該当 |
| ❌ マージ非推奨 | CI失敗 または コンフリクトあり |

`nodejs_24` / `gh` / `gh-stack` / `devenv` は変化の大小に関わらず常に ⚠️要確認 とする（理由は下記）。

- **`nodejs_24`**: アプリのランタイムそのもの。`docs/tech-stack.md` に明記されたバージョンとの整合性を確認し、Cloudflare Workers側の対応状況も確認する
- **`gh` / `gh-stack`**: [[dependabot-review]] の「複数PR承認時のマージ手順」で使う安全装置そのもの。マージ後に `gh stack --help` が壊れていないか動作確認することを確認事項として明記する
- **`devenv`**: `devenv.nix` が依存するモジュールAPIのスキーマが変わると `enterShell` ごと壊れうる。release notesの確認を確認事項として明記する

`⚠️ 要確認` と判定したPRには、判定理由に加えて上記の確認事項を具体的に記載する。

### 6. 呼び出し元への結果の受け渡し

同一セッション内で継続実行されるため、明示的な戻り値の受け渡しは不要。PRごとに「変化したinput」「主要パッケージのバージョン比較表」「判定」「⚠️の場合の確認事項」を確定させ、[[dependabot-review]] のレポート出力ステップでそのまま使う。
