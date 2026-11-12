import { getTranslations } from "next-intl/server";
import { listNotebooks, resolveNotebook } from "@/lib/notebooks";
import { BackLink } from "@/components/BackLink";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { WalkthroughView, type WalkthroughNotebookItem } from "@/components/WalkthroughView";

export default async function LabPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const nav = await getTranslations("nav");
  const wt = await getTranslations("walkthrough");
  const tnb = await getTranslations("notebooks");

  const notebooks: WalkthroughNotebookItem[] = await Promise.all(
    listNotebooks().map(async (nb) => ({
      slug: nb.slug,
      title: tnb(`${nb.slug}.title`),
      description: tnb(`${nb.slug}.description`),
      repoPath: (await resolveNotebook(nb.slug, locale)).repoPath,
    }))
  );

  const labels = {
    title: wt("title"),
    subtitle: wt("subtitle"),
    badgeBeginner: wt("badge_beginner"),
    badgeUnique: wt("badge_unique"),
    promptLabel: wt("prompt_label"),
    copyPrompt: wt("copy_prompt"),
    copied: wt("copied"),
    overviewTitle: wt("overview_title"),
    overviewDesc: wt("overview_desc"),
    navOverview: wt("nav_overview"),
    navIdea: wt("nav_idea"),
    navStandards: wt("nav_standards"),
    navFlow: wt("nav_flow"),
    navGuardrails: wt("nav_guardrails"),
    navSimVsQpu: wt("nav_sim_vs_qpu"),
    navBobalytics: wt("nav_bobalytics"),
    navNotebooks: wt("nav_notebooks"),
    cap1Title: wt("cap1_title"),
    cap1Challenge: wt("cap1_challenge"),
    cap1Prompt: wt("cap1_prompt"),
    cap1Explanation: wt("cap1_explanation"),
    cap1ValTrad: wt("cap1_value_trad"),
    cap1ValBob: wt("cap1_value_bob"),
    cap2Title: wt("cap2_title"),
    cap2Challenge: wt("cap2_challenge"),
    cap2Prompt: wt("cap2_prompt"),
    cap2Explanation: wt("cap2_explanation"),
    cap2ValTrad: wt("cap2_value_trad"),
    cap2ValBob: wt("cap2_value_bob"),
    cap3Title: wt("cap3_title"),
    cap3Challenge: wt("cap3_challenge"),
    cap3Prompt: wt("cap3_prompt"),
    cap3Explanation: wt("cap3_explanation"),
    cap3ValTrad: wt("cap3_value_trad"),
    cap3ValBob: wt("cap3_value_bob"),
    cap4Title: wt("cap4_title"),
    cap4Challenge: wt("cap4_challenge"),
    cap4Prompt: wt("cap4_prompt"),
    cap4Explanation: wt("cap4_explanation"),
    cap4ValTrad: wt("cap4_value_trad"),
    cap4ValBob: wt("cap4_value_bob"),
    cap5Title: wt("cap5_title"),
    cap5Challenge: wt("cap5_challenge"),
    cap5Prompt: wt("cap5_prompt"),
    cap5Explanation: wt("cap5_explanation"),
    cap5ValTrad: wt("cap5_value_trad"),
    cap5ValBob: wt("cap5_value_bob"),
    cap6Title: wt("cap6_title"),
    cap6Desc: wt("cap6_desc"),
    statExp: wt("stat_exp"),
    statCircuits: wt("stat_circuits"),
    statErrors: wt("stat_errors"),
    statVersion: wt("stat_version"),
    notebooksHeading: wt("notebooks_heading"),
    notebooksSubheading: wt("notebooks_subheading"),
    startNotebook1: wt("start_notebook_1"),
    tryInNotebook: wt("try_in_notebook"),
  };

  return (
    <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "1.5rem 1rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <BackLink href={`/${locale}`} label={nav("home")} />
        <LocaleSwitcher />
      </div>

      <WalkthroughView locale={locale} labels={labels} notebooks={notebooks} />
    </main>
  );
}
