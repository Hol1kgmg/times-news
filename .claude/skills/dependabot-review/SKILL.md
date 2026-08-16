---
name: dependabot-review
description: openなdependabotのPRを一覧し、ユーザーが選んだ対象PRについてマージ可能かをレビューする（check-only・マージやクローズは行わない）。CI状態・コンフリクト有無・バージョン差分（major/minor/patch）・変更内容を確認してレポートする。
allowed-tools: Bash(gh pr list:*), Bash(gh pr view:*), Bash(gh pr diff:*), Bash(gh pr checks:*), Read, Write, Grep, Glob
---

# dependabot-review — dependabot PR マージ可否レビュー（check-only）

openな dependabot PR を洗い出し、ユーザーが選んだ対象について CI・コンフリクト・変更内容を確認し、マージ可否を判定してレポートする。
レビュー結果はリポジトリ直下の `dependabot-review-report.md` にも出力する。

**このスキルはチェックと報告のみを行う。`gh pr merge` / `gh pr close` などの状態変更操作は行わない。**
マージ自体はユーザーの指示を受けて別途実施する。

## 手順

### 1. openな dependabot PR の一覧取得

```
gh pr list --author "app/dependabot" --state open --json number,title,headRefName,createdAt,url
```

- 結果が0件なら「openなdependabot PRはありません」と報告して終了する
- `headRefName` から更新パッケージ名とバージョン差分（例: `wrangler-4.103.0...4.123.0` のような形式ではなく `wrangler-4.123.0` のように新バージョンのみ含む命名が多いため、タイトルの `bump X from A to B` 表記を優先してA→Bを読み取る）
- major/minor/patch の判定は `bump X from A to B` の A/B を semver として比較する（メジャー番号が変わっていれば major bump として明示する）

### 2. ユーザーに対象PRを確認

AskUserQuestion（またはテキストでの確認）で、取得した一覧を提示し、どのPRをレビュー対象にするか選んでもらう。
- 選択肢には「すべてレビューする」を含める
- 複数選択・個別番号指定のどちらにも対応する
- `$ARGUMENTS` にPR番号が明示されていればこのステップは省略し、指定されたPRを対象とする

### 3. 対象PRごとの詳細確認

各PRについて以下を取得・確認する。

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

**変更内容**
```
gh pr diff <番号>
```
- `package.json` の対象パッケージのバージョン変更を確認する
- lockfile（`pnpm-lock.yaml` 等）以外に意図しない差分（アプリコードの変更等）が含まれていないか確認する
- major bump の場合は、body に記載された changelog / release notes へのリンクや breaking changes への言及を確認する

### 4. 判定基準

| 判定 | 条件 |
|---|---|
| ✅ マージ推奨 | CI全て成功 かつ コンフリクトなし かつ minor/patch bump かつ lockfile以外の意図しない差分なし |
| ⚠️ 要確認 | major bump／CI pending／body にbreaking changesの言及あり／lockfile以外に差分あり、のいずれかに該当 |
| ❌ マージ非推奨 | CI失敗 または コンフリクトあり |

`⚠️ 要確認` と判定したPRには、判定理由に加えて **具体的に何を確認すべきか** を必ず記載する（下記5節の「確認事項」列）。
- 対象パッケージ/actionのリリースノートURL（`https://github.com/<owner>/<repo>/releases` 形式で推測可）を明記し、確認すべき breaking changes の観点（API変更・実行環境要件・設定ファイル形式の変更など）を具体的に書く
- body に breaking changes の記載があれば、それを直接引用して転記する
- 一括更新（group PR）の場合は、その中でも影響範囲が大きいパッケージを名指しし、個別確認を促す
- 実行環境要件の変更（Node.jsバージョン等）が言及されている場合は、`mise.toml` や `package.json` の `engines` を実際に読み、要件を満たしているかどうかまで判定して記載する

### 5. レポート出力

チャット上に以下の形式で報告する:

```
## dependabot PR レビューレポート

| PR | パッケージ | バージョン | 種別 | CI | コンフリクト | 判定 | 備考 |
|---|---|---|---|---|---|---|---|
| #12 | eslint-plugin-... | 1.0.0→1.0.1 | patch | ✅ | なし | ✅ マージ推奨 | - |
| #5  | tanstack (group) | ... | minor/major混在 | ✅ | なし | ⚠️ 要確認 | 8パッケージ一括更新、個別に破壊的変更の有無を確認推奨 |

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
