---
name: dependabot-review-semver
description: dependabot-reviewから委譲される、npm（frontend/package.json）とgithub-actions（.github/workflows/）向けのバージョン差分判定sub-skill。PRタイトルの`bump X from A to B`からsemverを読み取り、major/minor/patchを判定し、判定基準に沿って✅/⚠️/❌を出す。単独では呼び出さない。
allowed-tools: Bash(gh pr view:*), Bash(gh pr diff:*), Read, Grep, Glob
---

# dependabot-review-semver — semverベースのバージョン差分判定

[[dependabot-review]] から `npm` / `github-actions` ecosystem のPR番号を渡されて呼び出される。単独では使わない（呼び出し元がPR一覧取得・基本情報取得・CI状態確認・レポート出力を担当するため、このskillは「変更内容の確認」と「判定」のみを行う）。

## 手順

### 1. バージョン差分の読み取り

各対象PRについて `gh pr view <番号> --json title,headRefName,body` の `title` から `bump X from A to B` 表記を読み取り、A→Bをsemverとして比較する。
- メジャー番号が変わっていれば major bump
- マイナー番号のみ変わっていれば minor bump
- パッチ番号のみ変わっていれば patch bump
- group PR（複数パッケージ一括更新）の場合は、含まれる各パッケージのバージョン差分を可能な範囲で列挙し、最も影響が大きい区分（major > minor > patch）を代表種別とする

`headRefName` は補助情報として使う（例: `dependabot/npm_and_yarn/frontend/wrangler-4.124.0` のように新バージョンのみ含む命名が多いため、単独では新旧比較に使えない）。

### 2. 変更内容の確認

```
gh pr diff <番号>
```
- `frontend/package.json`（npm）または `.github/workflows/*.yml`（github-actions）の対象パッケージ/actionのバージョン変更を確認する
- lockfile（`pnpm-lock.yaml` 等）以外に意図しない差分（アプリコードの変更等）が含まれていないか確認する
- major bump の場合は、body に記載された changelog / release notes へのリンクや breaking changes への言及を確認する

### 3. 判定基準

| 判定 | 条件 |
|---|---|
| ✅ マージ推奨 | CI全て成功 かつ コンフリクトなし かつ minor/patch bump かつ lockfile以外の意図しない差分なし |
| ⚠️ 要確認 | major bump／CI pending／body にbreaking changesの言及あり／lockfile以外に差分あり、のいずれかに該当 |
| ❌ マージ非推奨 | CI失敗 または コンフリクトあり |

CI状態・コンフリクト有無は呼び出し元（[[dependabot-review]]）がステップ4で取得済みの値を使う。

`⚠️ 要確認` と判定したPRには、判定理由に加えて **具体的に何を確認すべきか** を必ず記載する。
- 対象パッケージ/actionのリリースノートURL（`https://github.com/<owner>/<repo>/releases` 形式で推測可）を明記し、確認すべき breaking changes の観点（API変更・実行環境要件・設定ファイル形式の変更など）を具体的に書く
- body に breaking changes の記載があれば、それを直接引用して転記する
- 一括更新（group PR）の場合は、その中でも影響範囲が大きいパッケージを名指しし、個別確認を促す
- 実行環境要件の変更（Node.jsバージョン等）が言及されている場合は、`devenv.nix` や `package.json` の `engines` を実際に読み、要件を満たしているかどうかまで判定して記載する

### 4. 呼び出し元への結果の受け渡し

同一セッション内で継続実行されるため、明示的な戻り値の受け渡しは不要。PRごとに「バージョン差分（種別）」「判定」「⚠️の場合の確認事項」を確定させ、[[dependabot-review]] のレポート出力ステップでそのまま使う。
