# Portfolio

明るくモダンなポートフォリオサイト。Next.js App Router + Markdown ファイルベースのコンテンツ管理。

## 開発

```bash
npm install
npm run dev      # localhost:3000
```

```bash
npm run build    # 本番ビルド
npm run lint     # ESLint
npm run format   # Prettier
```

## コンテンツの追加

すべてのコンテンツは `contents/` ディレクトリ内の Markdown ファイルで管理します。

### トップページ（About）

`contents/about/` にファイルを追加します。ファイル名のプレフィックス（`01-`, `02-`）で表示順を制御します。

```
contents/about/
  01-profile.md     # type: profile  → prose レンダリング
  02-experience.md  # type: experience → タイムライン
  03-skills.md      # type: skills   → グリッド + バッジ
```

フロントマターの `type` フィールドでレイアウトを指定します。

**`type: experience` の例:**

```yaml
---
type: experience
title: Experience
items:
  - period: "2024 - 現在"
    role: "Software Engineer"
    company: "Example Corp"
    description: "説明文"
---
```

**`type: skills` の例:**

```yaml
---
type: skills
title: Skills
categories:
  - name: "Frontend"
    items: ["TypeScript", "React", "Next.js"]
---
```

### 記事（Articles）

`contents/articles/` に Markdown ファイルを追加します。

```yaml
---
title: 記事タイトル
date: "2024-12-01"
description: 記事の概要
---

本文...
```

### 受賞歴（Awards）

```yaml
---
title: 受賞名
date: "2024-11-15"
organization: 主催団体
description: 説明文
---
```

### 制作物（Products）

```yaml
---
title: プロダクト名
description: 説明文
url: https://example.com
---
```

## 技術スタック

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 + @tailwindcss/typography
- **Content**: gray-matter + marked
- **Deploy**: Vercel
