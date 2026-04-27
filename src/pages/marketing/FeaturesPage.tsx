import MarketingPlaceholder from "./MarketingPlaceholder";

export default function FeaturesPage() {
  return (
    <MarketingPlaceholder
      eyebrow="Features"
      title={<>Built around <em>how creators actually work</em>.</>}
      blurb="Pipeline-first, not tool-first. Every step picks up where the last one left off. No copy-paste. No tab juggling. Just throughput."
      bullets={[
        "Autosave the entire workflow — pick up where you left off.",
        "Per-step prompt overrides for advanced creators.",
        "Hook scoring + CTA placement review on every script.",
        "A/B test thumbnails and titles before publishing.",
        "Team workspaces with role-based access.",
      ]}
    />
  );
}
