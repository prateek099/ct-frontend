import MarketingPlaceholder from "./MarketingPlaceholder";

export default function PricingPage() {
  return (
    <MarketingPlaceholder
      eyebrow="Pricing"
      title={<>Simple pricing. <em>No surprises.</em></>}
      blurb="Free for 14 days. No credit card. Upgrade only when you're ready to publish weekly."
      bullets={[
        "Starter — Free forever. 3 video pipelines / month.",
        "Pro — $29 / month. Unlimited pipelines + Live Studio.",
        "Team — $79 / month. Up to 5 seats + shared library.",
        "Agency — Talk to us. Custom seats, SSO, white-label.",
      ]}
    />
  );
}
