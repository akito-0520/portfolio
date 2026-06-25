---
title: EasyCreateRotenApp
description: 学園祭の露店運営における「回転」を効率化するための従事者向け Web アプリ。4I で開発し、フロントエンドを担当。
url: https://github.com/hirune05/EasyCreateRotenAppWeb
createdAt: "2024-07-15"
---

## 概要

学園祭の露店運営における「回転」を効率化するための、露店従事者向け Web アプリ。4I プロジェクトとして開発し、文化祭期間中に実運用された（現在は文化祭終了に伴い運用停止）。

担当は **フロントエンド**。Next.js (App Router) + Tailwind CSS で従事者向け UI を構築し、Jotai による状態管理と Next.js の fetch を通じて Go (Echo) 製のバックエンド API と連携。JWT 認証を利用したログインフローや、注文・回転状況を扱う画面を実装した。

## 技術スタック

| レイヤー       | 技術                                             |
| -------------- | ------------------------------------------------ |
| フロントエンド | Next.js (App Router) / TypeScript / Tailwind CSS |
| 状態管理       | Jotai                                            |
| バックエンド   | Go (Echo) / Gorm                                 |
| データベース   | MySQL                                            |
| 認証           | JWT                                              |
| インフラ       | AWS (ECR / CloudFront) / Vercel                  |
| コンテナ       | Docker / Docker Compose                          |
