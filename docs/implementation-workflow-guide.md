# 実装ワークフローガイド（2フェーズ構成）

---

## 位置づけ

[layer-architecture-guide.md](./layer-architecture-guide.md) が「コードが最終的に満たすべき完成形の基準」を定義するのに対し、本ガイドは「そこへ至る実装過程の進め方」を定義する。

| ドキュメント | 役割 | 性質 |
|---|---|---|
| layer-architecture-guide.md | 完成形の合格基準（何を満たすべきか） | 時間軸を持たない構造ルール |
| 本ガイド | 実装過程の手法（どう進めるか） | 時間軸を持つプロセスルール |

参照方向は「本ガイド → アーキテクチャガイド」の一方向のみ。アーキテクチャガイドは実装過程の状態を関知しない。

---

## 方針

新規実装は **2フェーズ構成** で進める。

```
フェーズ1: widgets/ に仮実装（配置判断を保留し、動くものを先に作る）
   ↓ （指示があった時のみ）
フェーズ2: 適切なレイヤーへ振り分け（アーキテクチャガイドの基準を満たす）
```

- フェーズ1とフェーズ2は **別々の独立したタスク**。git のコミット粒度やマージのタイミングには紐づけない
- フェーズ2は **ユーザーの指示があった時のみ** 実行する。フェーズ1の作業中に自発的に振り分けを行わない
- アーキテクチャガイドの基準を満たしているかの判定は、フェーズ2のタスク内でチェックリストにより行う

---

## フェーズ1: widgets への仮実装

新規機能は `widgets/` に1スライスとして実装する。本来 `features/` `aggregates/` `entities/` に置くべきファイル群を、スライス内に同居させてよい。

```
widgets/order-summary/              ← フェーズ1の仮実装スライス
  index.ts                          ← 先頭に PHASE1 マーカー
  OrderSummary.tsx
  OrderSummary.module.css
  useOrderSummary.ts                ← 本来 features/entities に置くデータ取得も同居可
  adapters.ts                       ← 本来 entities/xxx/model/ に置く変換も同居可
  types.ts                          ← 本来 entities/xxx/model/ に置く型も同居可
  atoms.ts                          ← 本来 features/entities に置く状態も同居可
```

- スライス名は widgets の命名規約（名詞・kebab-case）に従う
- `index.ts` で公開 API を定義する（widgets の原則どおり）

### PHASE1 マーカー規約

フェーズ1で作成したスライスの `index.ts` 先頭に、grep 可能なマーカーコメントを付ける。

```ts
/* PHASE1: 未振り分け */
export { OrderSummary } from "./OrderSummary";
```

- マーカーはフェーズ2完了時に削除する
- `PHASE1` で検索すれば未振り分けスライスの一覧をいつでも取得できる

### 猶予されるルールと常時適用ルール

フェーズ1で猶予されるのは **「どのレイヤーに置くか」の配置判断のみ**。それ以外のルールは常時適用される。

| ルール | フェーズ1での扱い | 理由 |
|---|---|---|
| 配置の決定フローチャート（UI・BFF リクエスト・atom） | **猶予** | フェーズ2で適用する |
| 禁止パターン7（下位で完結できるのに上位に置く） | **猶予** | フェーズ1の本質そのもの |
| widgets の内部構成制約（atoms / types / adapters 禁止、データ取得3条件） | **猶予** | 仮実装スライスには同居を認める |
| レイヤー依存方向（下位→上位 import 禁止、同レイヤー間 import 禁止） | **常時適用** | 仮実装スライスは自己完結させる。他 widget から import したくなったらフェーズ2のシグナル |
| BFF 経由の原則（禁止パターン5・8） | **常時適用** | API キー露出はフェーズに関係なく事故になる |
| shared の純粋性（禁止パターン3・4） | **常時適用** | フェーズ1のコードは widgets に置くため shared を汚さない |
| コーディング規約（Branded Types・命名・アロー関数・CSS Modules） | **常時適用** | 後から直すコストの方が高い |

---

## フェーズ2: 振り分けタスク（指示駆動）

ユーザーから振り分けの指示があった時のみ、独立タスクとして実行する。

### 手順

1. **対象の特定** — 指示で対象が指定されていればそのスライス、指定がなければ `PHASE1` マーカーを検索して未振り分けスライスを列挙し、対象を確認する
2. **最終配置の決定** — アーキテクチャガイドの[決定フローチャート](./layer-architecture-guide.md#決定フローチャート)に従い、スライス内の各ファイルの配置先を決定する
3. **振り分け計画の提示** — 移動・分割の計画を提示し、承認を得る
4. **移動・分割の実施** — types / adapters → `entities/xxx/model/`、データ取得・mutation → `features/`（または entities / aggregates）、atom → 各スコープの配置先、など
5. **チェックリストによる判定** — 下記のチェックリストで完成形の基準を満たしているか確認する（`/arch-review` スキルで自動チェック可能）
6. **マーカー削除** — `PHASE1` マーカーを削除し、`just typecheck` / `just lint` / `just test` で検証する

### 完了判定チェックリスト

すべての項目は [layer-architecture-guide.md](./layer-architecture-guide.md) を基準とする（詳細は各セクションを参照）。

- [ ] 対象スコープ内に `PHASE1` マーカーが残っていない
- [ ] 各ファイルが決定フローチャートどおりの配置になっている（UI・BFF リクエスト・atom）
- [ ] 禁止パターン表（1〜9）のすべてに違反していない
- [ ] 依存方向が `app(routes) → pages → widgets → features → aggregates → entities → shared` の一方通行になっている
- [ ] entities 間の cross-import が composite → atomic の一方向のみになっている
- [ ] 外部非公開ファイルを持つスライスに `index.ts` の公開 API が定義されている
- [ ] `just typecheck` / `just lint` / `just test` が通る

---

## 付録

- 完成形の基準（アーキテクチャ）: [layer-architecture-guide.md](./layer-architecture-guide.md)
- コーディング規約: [coding-guide.md](./coding-guide.md)
- スタイリング（CSS Modules）: [styling-guide.md](./styling-guide.md)
