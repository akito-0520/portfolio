---
title: Next.js App Router 入門
date: "2024-12-01"
description: Next.js 15 の App Router を使ったポートフォリオサイトの構築について解説します。
---

## はじめに

Next.js の App Router は、React Server Components をベースにした新しいルーティングシステムです。Pages Router と比べて、より直感的なファイルベースのルーティングと、サーバー・クライアントの役割分担が明確になっています。

## ディレクトリ構成

```
src/app/
  layout.tsx   # 共通レイアウト
  page.tsx     # トップページ (/)
  articles/
    page.tsx   # 記事一覧 (/articles)
    [slug]/
      page.tsx # 記事詳細 (/articles/:slug)
```

## Server Components の活用

ファイル読み込みやデータフェッチは Server Components で行うことで、クライアントへの不要な JS 送信を防ぎます。

```typescript
// この関数はサーバーでのみ実行される
export default async function ArticlePage() {
  const data = await fetchData();
  return <div>{data}</div>;
}
```

## まとめ

App Router を使うことで、ファイルシステムベースのシンプルな構成で高パフォーマンスなサイトが構築できます。
