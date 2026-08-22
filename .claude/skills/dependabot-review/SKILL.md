---
name: dependabot-review
description: openなdependabotのPRを一覧し、ユーザーが選んだ対象PRについてマージ可能かをレビューする（デフォルトはcheck-only）。CI状態・コンフリクト有無を確認したうえで、ecosystemごとに専用skill（[[dependabot-review-semver]] / [[dependabot-review-nix-flake]]）へ委譲してバージョン差分と判定を行い、レポートに統合する。ユーザーが複数PRのマージを明示指示した場合のみ、gh-stackを使った安全なマージ手順（後述）に従いマージを実施する。
allowed-tools: Bash(gh pr list:*), Bash(gh pr view:*), Bash(gh pr diff:*), Bash(gh pr checks:*), Bash(gh pr merge:*), Bash(gh extension list:*), Bash(gh extension install:*), Bash(gh stack:*), Bash(gh run list:*), Bash(git fetch:*), Read, Write, Grep, Glob, Skill
---

# dependabot-review — dependabot PR マージ可否レビュー（デフォルトcheck-only）

openな dependabot PR を洗い出し、ユーザーが選んだ対象について CI・コンフリクト・変更内容を確認し、マージ可否を判定してレポートする。
変更内容の確認と判定（major/minor/patch や nixのバージョン差分）は、対象PRのecosystemに応じて専用のsub-skillに委譲する:

| ecosystem | 委譲先skill | 対象 |
|---|---|---|
| `npm` / `github-actions` | `dependabot-review-semver` | semverでバージョン差分を判定できるもの（`frontend/package.json`, `.github/workflows/`） |
| `nix` | `dependabot-review-nix-flake` | `flake.lock`（`nixpkgs` / `flake-utils` の各input） |

sub-skillはSkillツールで呼び出す（同一セッション内で継続実行されるため、以降の手順でsub-skillが出した判定結果をそのまま使ってレポートを作成できる）。

レビュー結果はリポジトリ直下の `dependabot-review-report.md` にも出力する。

**デフォルトはチェックと報告のみを行う。`gh pr merge` / `gh pr close` などの状態変更操作は、ユーザーが明示的にマージを指示するまで行わない。**
- 1件のみのマージ指示 → 通常通り `gh pr merge <番号> --squash --delete-branch` でよい
- 同一 package-ecosystem / directory（= 同一lockfileに触る）の**複数PR**のマージ指示 → 下記「複数PR承認時のマージ手順」に従う（過去に連続squashマージで`pnpm-lock.yaml`が破損した実例があるため。詳細は `pnpm-update-incident.md` の「4. 追記」を参照）

## 手順

### 1. openな dependabot PR の一覧取得

```
gh pr list --author "app/dependabot" --state open --json number,title,headRefName,createdAt,url
```

- 結果が0件なら「openなdependabot PRはありません」と報告して終了する

### 2. ユーザーに対象PRを確認

AskUserQuestion（またはテキストでの確認）で、取得した一覧を提示し、どのPRをレビュー対象にするか選んでもらう。
- 選択肢には「すべてレビューする」を含める
- 複数選択・個別番号指定のどちらにも対応する
- `$ARGUMENTS` にPR番号が明示されていればこのステップは省略し、指定されたPRを対象とする

### 3. ecosystemの判定

各対象PRの `headRefName` の先頭セグメントからecosystemを判定する（dependabotのブランチ命名規則: `dependabot/<package-manager>/...`）。

| `headRefName` プレフィックス | ecosystem |
|---|---|
| `dependabot/npm_and_yarn/` | npm |
| `dependabot/github_actions/` | github-actions |
| `dependabot/nix/` | nix |

判定に迷う場合は `gh pr view <番号> --json files` で変更ファイルを確認する（`frontend/package.json` や `frontend/pnpm-lock.yaml` を含む → npm、`.github/workflows/*.yml` を含む → github-actions、`flake.lock` を含む → nix）。

対象PRを ecosystem ごとにグルーピングする。

### 4. 対象PRごとの詳細確認

各PRについて以下を取得・確認する（ecosystem共通の部分）。

**基本情報とマージ可否**
```
gh pr view <番号> --json number,title,body,mergeable,mergeStateStatus,statusCheckRollup,additions,deletions,changedFiles,labels
```
- `mergeable` が `CONFLICTING` の場合はコンフリクトありとして明記する
- `mergeStateStatus` が `BLOCKED` の場合は理由（レビュー必須・CI未完了等）を推測して記載する

**CI状態**
```
gh pr checks <番号>
```
- 失敗しているチェックがあれば名前と結果を記載する
- pending中のチェックがあれば「CI実行中のため判定保留」と明記する

**変更内容とバージョン差分の判定（ecosystem別に委譲）**

ステップ3でグルーピングしたecosystemごとに、対応するsub-skillをSkillツールで呼び出す。呼び出し時は対象PR番号（複数可）と、上記で取得済みの基本情報・CI状態を渡す。

- npm / github-actions のPR → `Skill(skill: "dependabot-review-semver", args: "<対象PR番号...>")`
- nix のPR → `Skill(skill: "dependabot-review-nix-flake", args: "<対象PR番号...>")`

各sub-skillは、PRごとに「バージョン差分の種別」「判定（✅/⚠️/❌）」「⚠️の場合の確認事項」を返す。これを次のステップのレポートに使う。

### 5. レポート出力

チャット上に以下の形式で報告する:

```
## dependabot PR レビューレポート

| PR | パッケージ | バージョン | 種別 | CI | コンフリクト | 判定 | 備考 |
|---|---|---|---|---|---|---|---|
| #12 | eslint-plugin-... | 1.0.0→1.0.1 | patch | ✅ | なし | ✅ マージ推奨 | - |
| #5  | tanstack (group) | ... | minor/major混在 | ✅ | なし | ⚠️ 要確認 | 8パッケージ一括更新、個別に破壊的変更の有無を確認推奨 |
| #33 | nixpkgs | rev変更 | node/gh-stack影響あり | ✅ | なし | ⚠️ 要確認 | nodejs_24: 24.15.0→24.16.0、gh-stack: 0.1.0→0.1.0（変更なし） |

### 詳細（要確認・非推奨のPRのみ）
- PR番号ごとに判定理由と確認事項を記載
```

- レポート末尾に「マージを進める場合は対象PR番号を指定してください」と付記し、実際のマージはユーザー指示を待つ

### 6. レポートファイルへの出力

リポジトリ直下の `dependabot-review-report.md` を Write で作成（既存があれば上書き）する。既存ファイルがある場合は事前に Read してから上書きする。以下の構成に従う:

```markdown
# dependabot PR レビューレポート

`/dependabot-review` によるレビュー結果（YYYY-MM-DD時点、対象: PR #x〜#y）。

## ✅ マージ推奨

| PR | パッケージ | バージョン |
|---|---|---|
| [#12](https://github.com/<owner>/<repo>/pull/12) | ... | ... |

## ⚠️ 要確認

| PR | パッケージ | 種別 | 確認事項 |
|---|---|---|---|
| [#5](https://github.com/<owner>/<repo>/pull/5) | tanstack group | minor中心 | 具体的な確認ポイント（リリースノートURL・観点）をここに記載 |

## ❌ マージ非推奨

| PR | パッケージ | 理由 |
|---|---|---|

## 対象外（レビュー未実施）

一覧取得はしたがユーザーが選ばなかったPRがあれば、番号とタイトルのみここに列挙する
```

- PRリンクは `gh pr view <番号> --json url` または一覧取得時の `url` フィールドから取得する
- 既存の `dependabot-review-report.md` に「マージ済み」セクションがあり、今回のレビュー対象に含まれないPR番号の行が残っている場合は保持する（`gh pr view <番号> --json state` で `MERGED`/`CLOSED` を確認し、状態が変わっていればセクションを移動する）
- ファイル出力後、「`dependabot-review-report.md` を更新しました」とチャットで報告する

## 複数PR承認時のマージ手順（gh-stack使用）

ユーザーが同一 package-ecosystem / directory（例: `npm` / `/frontend`、または `nix` / `/`）の dependabot PR を**2件以上まとめてマージ**するよう指示した場合にのみ、この手順を使う。対象PRが1件のみ、または互いに異なる package-ecosystem / directory（同一lockfileを触らない）の場合はこの手順は不要で、通常通り個別に `gh pr merge <番号> --squash --delete-branch` すればよい。

### なぜ必要か

同一lockfileを触る複数PRを単純に連続squashマージすると、各PRの lockfile 差分が「PR作成時点のmain」を基準にしたテキストパッチであるため、GitHub上ではコンフリクトとして検出されないまま破損が生じることがある（実例: 2026-08-22, PR #27〜#31 の連続マージで `pnpm-lock.yaml` の `es-module-lexer` エントリが重複し main のCIが壊れた。詳細は `pnpm-update-incident.md` の「4. 追記」を参照）。これを防ぐため、1件マージするごとに残りのPRを最新mainへ再rebaseしてから次をマージする。

### 事前準備

`gh-stack` は Nix シェルに入ると自動でセットアップされる（`flake.nix` の `shellHook` が Nix 管理下のバイナリを `gh` の拡張ディレクトリにリンクする）。手動インストールは不要。動作確認のみ行う:

```
gh stack --help
```

`gh-stack` 自体が nix ecosystem の更新対象でもあるため、直前に `gh-stack` のバージョンが変わるnix PRをマージしていた場合は、この動作確認を必ず実施してから複数PRマージ手順に入る。

### 手順

1. マージ順を決める（通常はPR番号の昇順。ユーザー指定があればそれに従う）
2. 対象PRのブランチをスタックとして採用する（`headRefName` を使用）:
   ```
   gh stack init --base main <branch1> <branch2> ... <branchN>
   ```
   これにより各PRのbaseがGitHub上で下位ブランチに書き換わる点をユーザーに一言断っておく（例: PR2のbaseが `main` から `branch1` に変わる）
3. 最下位（最初）のPRをマージする:
   ```
   gh pr merge <PR番号1> --squash --delete-branch
   ```
4. 残りのPRを最新mainに追従させる:
   ```
   gh stack sync
   ```
   マージ済みブランチを自動検知して `--onto` で trunk 側に切り替え、残りのブランチを cascade rebase して force-push する
5. 再実行されたCIの結果を確認する:
   ```
   gh pr checks <PR番号2>
   ```
   全てpassしたら次をマージする。失敗していれば内容をユーザーに提示し、指示を仰ぐ（自動で修正しない）
6. 残りPRがなくなるまで 3〜5 を、次のPRを対象にして繰り返す
7. 全マージ後、mainのCIが成功していることを確認する:
   ```
   gh run list --branch main --limit 1
   ```
8. `dependabot-review-report.md` の「マージ済み」セクションを更新する

### 注意事項

- 手順の途中でユーザーが直接 `gh pr merge` を割り込ませたり、dependabotに `@dependabot rebase` をコメントしたりすると gh-stack の管理と競合するため、手順完了まで避けるようユーザーに伝える
- rebase時にコンフリクトが発生した場合は自動解決せず、コンフリクト内容をユーザーに提示して指示を仰ぐ（`gh stack rebase --abort` でいつでも中断可能）
