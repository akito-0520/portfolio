import ProfileSection from "./ProfileSection";
import ExperienceSection from "./ExperienceSection";
import SkillsSection from "./SkillsSection";

type Section = {
  slug: string;
  frontMatter: Record<string, unknown>;
  html: string;
};

type Experience = Record<string, string>;

type Props = {
  section: Section;
  experiences?: Experience[];
};

export default function AboutSection({ section, experiences = [] }: Props) {
  const { frontMatter, html } = section;
  const type = frontMatter.type as string;

  switch (type) {
    case "profile":
      return <ProfileSection html={html} />;
    case "experience":
      return (
        <ExperienceSection
          title={frontMatter.title as string}
          experiences={experiences}
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
