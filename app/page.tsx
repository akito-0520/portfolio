import AboutSection from "../components/about/AboutSection";
import ContactSection from "../components/about/ContactSection";
import { getAboutSections, getMarkdownList } from "../lib/markdown";

export default async function HomePage() {
  const sections = await getAboutSections();
  const experiences = getMarkdownList("experiences");
  const pinnedProducts = getMarkdownList("products")
    .filter((p) => (p.pinned as unknown) === true)
    .map((p) => ({
      title: p.title,
      description: p.description,
      url: p.url,
    }));

  return (
    <div className="space-y-16">
      {sections.map((section) => (
        <AboutSection
          key={section.slug}
          section={section}
          experiences={experiences}
          pinnedProducts={pinnedProducts}
        />
      ))}
      <ContactSection />
    </div>
  );
}
