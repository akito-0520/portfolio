# CLAUDE.md

ドキュメントは日本語で作成してください．

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 概要

落ち着いた雰囲気のミニマルなポートフォリオサイト。Next.js App Router + Tailwind CSS v4 + Markdown ファイルベースのコンテンツ管理。

## コマンド

```bash
npm run dev      # 開発サーバーを localhost:3000 で起動
npm run build    # 本番用ビルド
npm run lint     # ESLint を実行
npm run format   # Prettier でフォーマット（ファイルを上書き）
```

テストフレームワークは未導入。

## アーキテクチャ

**スタック:** Next.js 16、React 19、TypeScript、Tailwind CSS v4（`@tailwindcss/postcss`）、`@tailwindcss/typography`、gray-matter、marked

**ルーティング:**

| ルート             | ファイル                           | 内容                                  |
| ------------------ | ---------------------------------- | ------------------------------------- |
| `/`                | `src/app/page.tsx`                 | `contents/about.md` を読み込んで表示  |
| `/articles`        | `src/app/articles/page.tsx`        | `contents/articles/*.md` の一覧       |
| `/articles/[slug]` | `src/app/articles/[slug]/page.tsx` | 記事詳細                              |
| `/awards`          | `src/app/awards/page.tsx`          | `contents/awards/*.md` の一覧         |
| `/products`        | `src/app/products/page.tsx`        | `contents/products/*.md` のカード一覧 |

**コンテンツ管理:**

- コンテンツはすべて `contents/` 以下の Markdown ファイルで管理
- `src/lib/markdown.ts` が2つの関数を提供:
  - `getMarkdownFile(filePath)` — 単一ファイルを読み込み `{ frontMatter, content, html }` を返す
  - `getMarkdownList(subDir)` — サブディレクトリ内の全 `.md` を一覧取得し `date` 降順でソート
- フロントマターは gray-matter でパース、本文は marked で HTML に変換
- `prose prose-zinc` クラス（`@tailwindcss/typography`）でレンダリング

**フロントマターのフィールド:**

| カテゴリ | フィールド                                     |
| -------- | ---------------------------------------------- |
| articles | `title`、`date`、`description`                 |
| awards   | `title`、`date`、`organization`、`description` |
| products | `title`、`description`、`url`（任意）          |

**パスエイリアス:** `@/*` → `src/*`（`tsconfig.json`）
