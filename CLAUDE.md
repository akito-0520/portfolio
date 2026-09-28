# CLAUDE.md

ドキュメントは日本語で作成してください．

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 概要

明るくモダンなポートフォリオサイト。Next.js App Router + Tailwind CSS v4 + Markdown ファイルベースのコンテンツ管理。

## コマンド

```bash
npm run dev      # 開発サーバーを localhost:3000 で起動
npm run build    # 本番用ビルド
npm run lint     # ESLint を実行
npm run format   # Prettier でフォーマット（ファイルを上書き）
npm run preview:workers  # 静的書き出し（out/）を Workers としてローカルで確認
npm run deploy:workers   # Workers にデプロイ（通常は GitHub Actions が main への push で行う）
```

### デプロイ

`next.config.ts` の `output: "export"` で、すべてのページを静的な HTML として `out/` に書き出す。同じ成果物を Vercel と Cloudflare Workers（静的アセット、`wrangler.jsonc`）の両方で配信できる。サーバーでしか動かない機能（API Routes、`headers()`、画像の最適化など）は使わない。

テストフレームワークは未導入。

## アーキテクチャ

**スタック:** Next.js 16、React 19、TypeScript、Tailwind CSS v4（`@tailwindcss/postcss`）、`@tailwindcss/typography`、gray-matter、marked

**パスエイリアス:** `@/*` → `src/*`（`tsconfig.json`）

---

### ルーティング

| ルート             | ファイル                           | 内容                                         |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| `/`                | `src/app/page.tsx`                 | `contents/about/` 内の複数 md を結合して表示 |
| `/articles`        | `src/app/articles/page.tsx`        | `contents/articles/*.md` の一覧              |
| `/articles/[slug]` | `src/app/articles/[slug]/page.tsx` | 記事詳細                                     |
| `/experiences`     | `src/app/experiences/page.tsx`     | `contents/experiences/*.md` の一覧           |
| `/products`        | `src/app/products/page.tsx`        | `contents/products/*.md` のカード一覧        |

---

### コンテンツ管理（`src/lib/markdown.ts`）

3つの関数を提供:

| 関数                        | 用途                                                                 |
| --------------------------- | -------------------------------------------------------------------- |
| `getAboutSections()`        | `contents/about/*.md` をファイル名順に読み込み、セクション配列を返す |
| `getMarkdownFile(filePath)` | 単一ファイルを読み込み `{ frontMatter, content, html }` を返す       |
| `getMarkdownList(subDir)`   | サブディレクトリ内の全 `.md` を一覧取得し `createdAt` 降順でソート   |

---

### About セクションシステム（`/` ページ）

`contents/about/` 内のファイルを `01-`, `02-` のようなプレフィックスでソートして順番に表示する。各ファイルのフロントマター `type` フィールドで使用コンポーネントを切り替える。

**ディスパッチャー:** `src/components/about/AboutSection.tsx` が `type` を読んで対応コンポーネントを呼ぶ。

| `type`       | コンポーネント      | レイアウト               | フロントマターフィールド                               |
| ------------ | ------------------- | ------------------------ | ------------------------------------------------------ |
| `profile`    | `ProfileSection`    | prose（本文 Markdown）   | —                                                      |
| `experience` | `ExperienceSection` | 縦タイムライン           | `title`、`items[]{period, role, company, description}` |
| `skills`     | `SkillsSection`     | 2カラムグリッド + バッジ | `title`、`categories[]{name, items[]}`                 |

新しい `type` を追加する手順:

1. `src/components/about/XxxSection.tsx` を作成
2. `AboutSection.tsx` の `switch` に `case "xxx"` を追加
3. `contents/about/NN-xxx.md` を作成して `type: xxx` を設定

---

### スタイリング

- Tailwind CSS v4 を使用。設定ファイル（`tailwind.config.js`）は不要で、`globals.css` の `@theme inline` ブロックでカスタム変数を定義。
- フォントは Geist Sans / Geist Mono（`layout.tsx` で CSS 変数として注入）。
- レイアウト幅は `max-w-2xl px-6`（`layout.tsx` の `<main>`）。
- Markdown レンダリングには `prose prose-slate` クラスを使用。カラーは `globals.css` でカスタマイズ済み。
- クラスの並び順は `prettier-plugin-tailwindcss` が自動ソート。

---

### フロントマター（articles / experiences / products）

| カテゴリ    | フィールド                                                         |
| ----------- | ------------------------------------------------------------------ |
| articles    | `title`、`createdAt`、`updatedAt`、`tags`、`author`、`description` |
| experiences | `title`、`date`、`organization`、`description`                     |
| products    | `title`、`description`、`url`（任意）                              |
