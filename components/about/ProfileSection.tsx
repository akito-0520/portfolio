type Props = {
  html: string;
};

export default function ProfileSection({ html }: Props) {
  return (
    <article
      className="prose prose-slate max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
