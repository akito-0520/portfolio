---
title: おばあちゃんがスマホで困った時にLINEで気軽に聞けるAI Botを作った話
createdAt: "2026-05-01"
updatedAt: "2026-05-01"
tags: ["bot", "AI", "アプリ開発", "個人開発", "linebot"]
author: akito-0520
description: シニア向けに「孫の代わりにAIが24時間答えてくれるLINE Bot」mago.aiを開発した記録。Go + Next.js + Supabase + Claude + LINE Messaging APIの技術構成を解説。
---

## はじめに

シニア世代の祖父母へのスマホ操作説明が課題となったため、「孫の代わりに AI が 24 時間答えてくれる LINE Bot」を開発しました。プロジェクト名は **mago.ai**（孫 + AI）。

技術構成：Echo (Go) + Next.js + Supabase + Anthropic Claude + LINE Messaging API + Fly.io / Vercel

## アプリケーション概要

- **ユーザーインターフェース：** LINE Bot（シニア向け UX 配慮）
- **管理画面：** Web（孫専用、Google ログイン対応）
- **主要機能：**
  - 複数祖父母を 1 つの管理アカウントで管理（マルチテナント）
  - 24 時間の会話文脈保持
  - 「解決しなかった」ボタンで孫へ LINE Push 通知
  - プラン制度（無料/基本）

## 技術スタック

| レイヤ       | 採用技術                                                    |
| ------------ | ----------------------------------------------------------- |
| Bot サーバー | Go 1.26 + Echo v4 + sqlx + pgx                              |
| AI           | Anthropic Claude (claude-sonnet-4-6) + プロンプトキャッシュ |
| DB/Auth      | Supabase (Postgres + Auth + RLS + RPC)                      |
| 管理画面     | Next.js 16 App Router + Tailwind + shadcn/ui                |
| ホスティング | Fly.io（東京）+ Vercel                                      |
| 監視         | `log/slog` (JSON)                                           |
| CI/CD        | GitHub Actions + Fly.io 自動デプロイ                        |

## アーキテクチャ

Clean Architecture に準拠。「Echo + LINE に学習スコープを絞り、その他はプロダクション水準」という方針で実装。

```
internal/
├── domain/          # エンティティ（外部依存ゼロ）
├── usecase/         # アプリケーションロジック + Ports
├── infrastructure/  # 具象実装
└── interface/http/  # Echo handler
```

## LINE Bot 開発のポイント

### 1. Webhook 署名検証

公式 SDK の `webhook.ParseRequest` で HMAC-SHA256 検証を実施。複数チャネル運用時はログに prefix を付与。

### 2. Reply API と Claude 呼び出しの非同期処理

LINE Platform は 3 秒以内に 200 を返さないと再送。Claude API 処理は goroutine で実行し、即座に 200 を返す仕様。

### 3. リッチメニュー

シニア向けに「新しい質問」「解決しなかった」の 2 ボタン配置。定義と画像は別 API で送信。

### 4. 通知用に別チャネルを用意

- おばあちゃん用 BOT：Reply API（webhook トリガー）
- 通知用 BOT：Push API（任意タイミング、孫が友だち登録）

チャネル分離により Channel Secret 取り違え事故を防止。

## Claude API の使用方法

- システムプロンプトはキャッシュ制御対象
- スタイル指示：「150 文字目安、上限 250 文字」「絵文字・Markdown 装飾なし」
- 会話履歴：`max(now - 24h, session_reset_at)` 以降の直近 20 ターンを取得
- 「新しい質問」で `session_reset_at = now()` により履歴をリセット

## プラン制度

最初から課金導入を想定した設計：

```sql
create table plans (
  code text primary key,
  max_line_users int,
  hourly_limit int,
  daily_limit int
);

create table admin_plans (
  admin_id uuid primary key,
  plan_code text references plans(code)
);
```

レート制限はインメモリのスライディングウィンドウで実装。管理者単位でカウント。

## Supabase RLS と RPC

- **SELECT：** RLS で自分の配下データのみ許可
- **INSERT/UPDATE/DELETE：** RPC（security definer）に集約

RPC 内でビジネスルール検証（プラン上限チェック、admin_id 検証等）を実施。

## デプロイ

- Backend：GitHub Actions の自動デプロイ（`flyctl deploy --remote-only`）
- Frontend：Vercel が GitHub 連携で自動デプロイ + PR プレビュー
- Supabase：ローカルから `supabase db push` を手動実行

CI では golangci-lint、go test、npm build、gitleaks を実行。

## 学習ポイント

- 学習スコープを明確に絞定（Echo + LINE）
- TDD によるテスト先行開発
- Goroutine + graceful shutdown の実装
- pgbouncer と pgx の prepared statement 衝突回避（`QueryExecModeExec`）

## 今後の予定

- Stripe 統合による課金プラン正式リリース
- システムプロンプトの実運用ベースチューニング

## まとめ

個人プロジェクトを通じて LINE Messaging API、Echo フレームワーク、Supabase RLS + RPC の実装経験を習得。シニア向けの見守りサービス構築の参考になることを期待。
