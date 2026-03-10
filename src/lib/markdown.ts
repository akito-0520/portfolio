import matter from "gray-matter";
import { marked } from "marked";
import fs from "fs";
import path from "path";

const CONTENTS_DIR = path.join(process.cwd(), "contents");

export async function getMarkdownFile(filePath: string) {
  const fullPath = path.join(CONTENTS_DIR, filePath);
  const raw = fs.readFileSync(fullPath, "utf-8");
  const { data: frontMatter, content } = matter(raw);
  const html = String(await marked.parse(content));
  return { frontMatter, content, html };
}

export function getMarkdownList(subDir: string) {
  const dirPath = path.join(CONTENTS_DIR, subDir);
  if (!fs.existsSync(dirPath)) return [];

  return fs
    .readdirSync(dirPath)
    .filter((f) => f.endsWith(".md"))
    .map((filename) => {
      const raw = fs.readFileSync(path.join(dirPath, filename), "utf-8");
      const { data: frontMatter } = matter(raw);
      return { slug: filename.replace(".md", ""), ...frontMatter } as Record<
        string,
        string
      >;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}
