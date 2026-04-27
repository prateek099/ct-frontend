import MarketingPlaceholder from "./MarketingPlaceholder";

export default function BlogPage() {
  return (
    <MarketingPlaceholder
      eyebrow="Blog & changelog"
      title={<>Notes from <em>the studio</em>.</>}
      blurb="What we ship, what we learn, and the playbooks our top creators use. New posts every Thursday."
      bullets={[
        "Hook engineering — what makes the first 7 seconds work.",
        "We rebuilt our title generator. Here's what changed.",
        "The 3 metrics that actually matter in your first 90 days.",
        "Live Studio is here — early access for Pro users.",
      ]}
    />
  );
}
