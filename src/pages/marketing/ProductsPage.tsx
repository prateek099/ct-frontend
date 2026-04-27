import MarketingPlaceholder from "./MarketingPlaceholder";

export default function ProductsPage() {
  return (
    <MarketingPlaceholder
      eyebrow="Products"
      title={<>Every tool a creator needs — <em>under one roof</em>.</>}
      blurb="From idea to thumbnail to publish, Creator OS bundles 19 AI-powered tools that talk to each other. Pick a workflow and watch it run."
      bullets={[
        "Live Studio — write, score, and ship a video in one window.",
        "Video Idea Generator with niche-tuned scoring.",
        "Script + Title + SEO + Thumbnail pipeline.",
        "Channel stats, trending finder, and content calendar.",
        "Subtitles, copyright check, link-in-bio, and more.",
      ]}
    />
  );
}
