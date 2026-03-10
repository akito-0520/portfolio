import { getAboutSections } from "@/lib/markdown";
import AboutSection from "@/components/about/AboutSection";

export default async function HomePage() {
  const sections = await getAboutSections();

  return (
    <div className="space-y-16">
      {sections.map((section) => (
        <AboutSection key={section.slug} section={section} />
      ))}
    </div>
  );
}
