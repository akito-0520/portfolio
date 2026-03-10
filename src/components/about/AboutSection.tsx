import ProfileSection from "./ProfileSection";
import ExperienceSection from "./ExperienceSection";
import SkillsSection from "./SkillsSection";

type Section = {
  slug: string;
  frontMatter: Record<string, unknown>;
  html: string;
};

export default function AboutSection({ section }: { section: Section }) {
  const { frontMatter, html } = section;
  const type = frontMatter.type as string;

  switch (type) {
    case "profile":
      return <ProfileSection html={html} />;
    case "experience":
      return (
        <ExperienceSection
          title={frontMatter.title as string}
          items={
            frontMatter.items as Parameters<
              typeof ExperienceSection
            >[0]["items"]
          }
        />
      );
    case "skills":
      return (
        <SkillsSection
          title={frontMatter.title as string}
          categories={
            frontMatter.categories as Parameters<
              typeof SkillsSection
            >[0]["categories"]
          }
        />
      );
    default:
      return <ProfileSection html={html} />;
  }
}
