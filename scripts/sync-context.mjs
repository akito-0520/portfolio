/**
 * contents/ の公開コンテンツを、個人コンテキストサーバ（context-server）に同期する。
 * MCP から記事・制作物・経歴・登壇を引けるようにするため。正はこのリポジトリの md。
 *
 *   CONTEXT_INGEST_URL=... CONTEXT_INGEST_TOKEN=... node scripts/sync-context.mjs
 *   node scripts/sync-context.mjs --dry-run   # 送る内容の件数だけ確認する
 */
import { readdir, readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import matter from "gray-matter";

/** contents/ のフォルダ → context-server の source。about は対象外 */
const SOURCES = {
  articles: "article",
  products: "product",
  experiences: "experience",
  slides: "slide",
};

const str = (value) => (value == null || value === "" ? null : String(value));

/** 「2023-10-14~15」のような期間は開始日を使う。YAML が Date 型で返した場合にも対応する */
function toDate(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const match = /^\d{4}-\d{2}-\d{2}/.exec(String(value ?? ""));
  return match ? match[0] : null;
}

function toItem(source, file, raw) {
  const { data, content } = matter(raw);
  const body = content.trim();
  return {
    source,
    slug: basename(file, ".md"),
    title: String(data.title ?? basename(file, ".md")),
    description: str(data.description),
    // experiences は組織名も語る材料になるので本文の先頭に添える
    body:
      source === "experience" && data.organization
        ? `所属: ${data.organization}\n\n${body}`
        : body,
    date: toDate(data.date ?? data.createdAt),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    url: str(data.url),
  };
}

async function collect() {
  const items = [];
  for (const [dir, source] of Object.entries(SOURCES)) {
    const path = join("contents", dir);
    const files = (await readdir(path)).filter((f) => f.endsWith(".md")).sort();
    for (const file of files) {
      items.push(
        toItem(source, file, await readFile(join(path, file), "utf8")),
      );
    }
  }
  return items;
}

const items = await collect();
const counts = Object.values(SOURCES)
  .map((s) => `${s}: ${items.filter((i) => i.source === s).length}`)
  .join(", ");

if (process.argv.includes("--dry-run")) {
  console.log(`[dry-run] ${items.length} 件（${counts}）`);
  process.exit(0);
}

const { CONTEXT_INGEST_URL: url, CONTEXT_INGEST_TOKEN: token } = process.env;
if (!url || !token) {
  console.log(
    "CONTEXT_INGEST_URL / CONTEXT_INGEST_TOKEN が未設定のため、同期をスキップします。",
  );
  process.exit(0);
}

const res = await fetch(url, {
  method: "PUT",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ items }),
});
const text = await res.text();
if (!res.ok) {
  console.error(`同期に失敗しました: ${res.status} ${text}`);
  process.exit(1);
}
console.log(`${items.length} 件（${counts}）を送りました: ${text}`);
