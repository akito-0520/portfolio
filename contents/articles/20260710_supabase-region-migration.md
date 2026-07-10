---
title: Supabaseのリージョンを移行した話
createdAt: "2026-07-10"
updatedAt: "2026-07-10"
tags: ["Supabase", "PostgreSQL", "個人開発", "インフラ"]
author: akito-0520
description: バックエンドとSupabaseのリージョンが離れておりレイテンシが大きかったため、Supabase CLIを使ってデータベースを別リージョンの新プロジェクトへ移行した記録。
---

## はじめに

バックエンドなどのサーバーと Supabase のリージョンが離れすぎており、レイテンシが大きく（遅く）なっていたため、リージョンを変更（移行）することにしました。ユーザー数が増える前のタイミングで実施した記録です。

基本的には、以下の公式ドキュメントの手順に従って進めました。

- **参考：** [Migrating within Supabase / Backup & Restore](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore)

### 動作環境

- macOS 26.5.2
- Supabase CLI 2.109.1
- Supabase Hobby プラン

---

## 移行の手順

### 1. 移行先の新規プロジェクトを作成

まずは移行先となる新しいプロジェクトを立ち上げます。この際、**リージョン設定を間違えないよう注意**してください。

データベースのパスワードは後ほど使うためメモしておきます。また、必要に応じて RLS（Row Level Security）設定の有効化なども事前に行っておきます。

### 2. 旧プロジェクトの「Connection string」を控える

旧プロジェクトの管理画面を開き、プロジェクト画面の「Connect」タブを押します。
「Direct」を選択した後、**Connection string** の値をメモっておきます。（もしデータベースのパスワードを忘れた場合は、リセットしてメモしておいてください）

```text
postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres
```

### 3. Supabase CLIのインストールと準備

Homebrew を使って Supabase CLI をインストールします。

```bash
brew install supabase/tap/supabase
```

インストール後、バージョンが表示されるか確認します。

```bash
supabase -v
```

確認できたら、任意の場所にバックアップ保存用のフォルダを作成して移動します。

```bash
mkdir supabase-backup && cd supabase-backup
```

### 4. 旧プロジェクトからのデータエクスポート（ダンプ）

以下の 3 つのコマンドを実行して、古いデータベースからデータを抽出します。
※ `[CONNECTION_STRING]` の部分は、手順 2 で控えた旧プロジェクトの Connection string に置き換えてください。

```bash
supabase db dump --db-url "[CONNECTION_STRING]" -f roles.sql --role-only
supabase db dump --db-url "[CONNECTION_STRING]" -f schema.sql
supabase db dump --db-url "[CONNECTION_STRING]" -f data.sql --use-copy --data-only -x "storage.buckets_vectors" -x "storage.vector_indexes"
```

実行が完了すると、フォルダ内に 3 つの SQL ファイル（`roles.sql`、`schema.sql`、`data.sql`）が保存されます。

### 5. 新プロジェクトへのデータインポート

新しく作成したプロジェクトの Connection string を取得し、以下の `[CONNECTION_STRING]` と置き換えて実行します。これにより、先ほど抽出した SQL ファイルを用いて新しいデータベースにデータを差し込みます。

```bash
psql \
  --single-transaction \
  --variable ON_ERROR_STOP=1 \
  --file roles.sql \
  --file schema.sql \
  --command 'SET session_replication_role = replica' \
  --file data.sql \
  --dbname "[CONNECTION_STRING]"
```

成功すると、新しいデータベースへデータが移行されます。
あとは、OAuth 認証などを利用している場合は、新プロジェクト側でも同様に有効化などの設定を行ってください。

## つまずいたポイント

### 1. スーパーアドミンに関するエラー

新しいデータベースにデータを差し込む（インポートする）際、以下のエラーが発生しました。

```plaintext
psql:roles.sql:13: ERROR:  "supabase_admin" is a reserved role, only superusers can modify it
```

#### 原因と対策：スーパーアドミンの行をコメントアウトする

このエラーは、`roles.sql` を実行する際に、一般権限のユーザーがスーパーアドミンの設定を変更しようとしたために発生しているようです。

対策として、`roles.sql` を開き、`supabase_admin` などのスーパーアドミンに関する記述がある行をコメントアウトしてから、再度インポートのコマンドを実行することで解決できました。

### 2. OAuth認証の有効化とURLの設定漏れ

データの移行自体は完了したものの、実際のアプリケーション側で認証（サインイン）ができない状態になっていました。

#### 原因と対策：Authentication 設定を新プロジェクト側でも行う

新しいプロジェクト側で OAuth の有効化設定と、リダイレクト URL の設定を忘れていたことが原因でした。データベースの移行だけでなく、Authentication 周りのプラットフォーム設定も新プロジェクト側で再度合わせておく必要があります。
