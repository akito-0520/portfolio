# CLAUDE.md

ドキュメントは日本語で作成してください．

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 要件

### 1. 概要 (Overview)

落ち着いた雰囲気のレスポンシブなポートフォリオサイトの構築。

### 2. Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **Content Management**: local Markdown files (`/contents/*.md`)
- **Parser**: `gray-matter` (YAML frontmatter の解析)
- **Deployment**: Vercel

### 3. ルーティング構成 (Routing)

- `/` : トップページ。`/contents/about.md` を埋め込んで表示。
- `/articles` : 記事一覧・詳細。
- `/awards` : 受賞歴一覧。
- `/products` : 制作物一覧。

### 4. コンテンツ管理 (Content Management)

- すべてのコンテンツは `/contents` ディレクトリ内の Markdown (.md) ファイルで管理する。
- ファイルベースのコンテンツ取得システムを構築すること。

### 5. デザイン要件 (Design & UI)

- **雰囲気**: 落ち着いた、ミニマル、または洗練されたトーン。
- **レスポンシブ**: PC、タブレット、スマートフォン全てのデバイスで最適に表示。
- **UIコンポーネント**: 清潔感のあるタイポグラフィと十分な余白。

### 6. 機能要件 (Functional Requirements)

- Markdownのパース機能。
- `/` における `about.md` の動的インポートとレンダリング。
- 各ルートに対応するコンテンツのフィルタリング表示。

## コマンド

```bash
npm run dev      # 開発サーバーを localhost:3000 で起動
npm run build    # 本番用ビルド
npm run lint     # ESLint を実行
npm run format   # Prettier でフォーマット（ファイルを上書き）
```

テストフレームワークは未導入。

## アーキテクチャ

Next.js 16 App Router を使ったポートフォリオサイトで、Markdown ベースのブログ機能を持つ。

**スタック:** Next.js、React 19、TypeScript、Tailwind CSS v4、gray-matter、marked

**コンテンツ:** Markdown ファイルは `contents/` に置く。`gray-matter` でフロントマターをパースし、`marked` で HTML にレンダリングする。フロントマターの期待フィールド: `title`、`thumbnail`。

## 開発時の注意点

- 記事の Markdown ファイルは `contents/` ディレクトリに置く
- `src/lib/markdown.ts` のパス設定を `contents/` に合わせる
- 新規コンポーネントは `src/components/` に置く
- Tailwind v4 のユーティリティクラスを使う
- 変更後は `npm run dev` で動作確認する

## 記事の追加方法

1. `contents/` ディレクトリに Markdown ファイルを作成する
2. フロントマターに `title` と `thumbnail` を設定する
3. `src/lib/markdown.ts` のパス設定を `contents/` に合わせる
4. `npm run dev` で動作確認する

## 記事の修正方法

1. `contents/` ディレクトリの Markdown ファイルを修正する
2. `src/lib/markdown.ts` のパス設定を `contents/` に合わせる
3. `npm run dev` で動作確認する

## 記事の削除方法

1. `contents/` ディレクトリの Markdown ファイルを削除する
2. `src/lib/markdown.ts` のパス設定を `contents/` に合わせる
3. `npm run dev` で動作確認する
