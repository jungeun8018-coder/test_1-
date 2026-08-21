import { getLegacyMain, pageDefinitions, type LegacyPageName } from "@/lib/legacy-pages";

type LegacyPageProps = {
  page: LegacyPageName;
};

export function LegacyPage({ page }: LegacyPageProps) {
  const { bodyClass } = pageDefinitions[page];

  return (
    <div
      className={bodyClass}
      dangerouslySetInnerHTML={{ __html: getLegacyMain(page) }}
    />
  );
}
