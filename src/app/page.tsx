import { getMarkdownFile } from "@/lib/markdown";

export default async function HomePage() {
  const { html } = await getMarkdownFile("about.md");

  return (
    <article
      className="prose prose-zinc max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
