import MarketingPlaceholder from "./MarketingPlaceholder";

export default function AboutPage() {
  return (
    <MarketingPlaceholder
      eyebrow="About"
      title={<>We build for the <em>independent creator</em>.</>}
      blurb="A small team, obsessed with one question: how do we help one person ship a great video this week, every week?"
      bullets={[
        "Founded in 2025 by creators, for creators.",
        "Distributed team across three timezones.",
        "Backed by founders of the tools you already use.",
        "Privacy-first — your scripts and data stay yours.",
      ]}
    />
  );
}
