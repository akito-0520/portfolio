import fs from "fs";
import path from "path";
import matter from "gray-matter";

const slidesDir = path.join(process.cwd(), "contents/slides");

export type Slide = {
  slug: string;
  title: string;
  description?: string;
  date?: string;
  pdfFile: string;
};

export function getSlideList(): Slide[] {
  if (!fs.existsSync(slidesDir)) return [];

  return fs
    .readdirSync(slidesDir)
    .filter((f) => f.endsWith(".md"))
    .map((filename) => {
      const raw = fs.readFileSync(path.join(slidesDir, filename), "utf-8");
      const { data } = matter(raw);
      return {
        slug: filename.replace(/\.md$/, ""),
        title: data.title ?? filename.replace(/\.md$/, ""),
        description: data.description,
        date: data.date,
        pdfFile: data.pdfFile,
      };
    })
    .sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return a.date < b.date ? 1 : -1;
    });
}

export function getSlide(slug: string): Slide | null {
  const filePath = path.join(slidesDir, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data } = matter(raw);
  return {
    slug,
    title: data.title ?? slug,
    description: data.description,
    date: data.date,
    pdfFile: data.pdfFile,
  };
}
