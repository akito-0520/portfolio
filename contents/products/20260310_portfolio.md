---
title: Portfolio
description: Next.js App Router と Markdown ファイルベースのコンテンツ管理で構築した、明るくモダンな個人ポートフォリオサイト。
url: https://akiton.net
createdAt: "2026-03-10"
---

## 概要

自分自身のプロフィール・実績・記事・制作物を公開するために構築したポートフォリオサイト。`contents/` 配下の Markdown ファイルをビルド時に読み込む構成で、記事の追加はファイルを置くだけで完結する。フロントマターの `type` フィールドでセクションのレイアウト（profile / experience / skills）を切り替える仕組みを採用している。

## 技術スタック

| レイヤー       | 技術                                            |
| -------------- | ----------------------------------------------- |
| フレームワーク | Next.js 16 (App Router) / React 19 / TypeScript |
| スタイリング   | Tailwind CSS v4 / @tailwindcss/typography       |
| コンテンツ     | Markdown (gray-matter / marked)                 |
| 品質管理       | ESLint / Prettier (prettier-plugin-tailwindcss) |
| インフラ       | Vercel                                          |
