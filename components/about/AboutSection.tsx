import ProfileSection from "./ProfileSection";
import ExperienceSection from "./ExperienceSection";
import SkillsSection from "./SkillsSection";
import ProductsSection from "./ProductsSection";

type Section = {
  slug: string;
  frontMatter: Record<string, unknown>;
  html: string;
};

type Product = {
  title: string;
  description: string;
  url?: string;
};

type Props = {
  section: Section;
  experiences?: Record<string, string>[];
  pinnedProducts?: Product[];
};

export default function AboutSection({
  section,
  experiences = [],
  pinnedProducts = [],
}: Props) {
  const { frontMatter, html } = section;
  const type = frontMatter.type as string;

  switch (type) {
    case "profile":
      return <ProfileSection html={html} />;
    case "experience":
      return (
        <ExperienceSection
          title={frontMatter.title as string}
          experiences={
            experiences as Parameters<
              typeof ExperienceSection
            >[0]["experiences"]
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
    case "products":
      return (
        <ProductsSection
          title={frontMatter.title as string}
          products={pinnedProducts}
        />
      );
    default:
      return <ProfileSection html={html} />;
  }
}
