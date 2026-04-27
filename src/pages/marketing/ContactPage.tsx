import MarketingPlaceholder from "./MarketingPlaceholder";

export default function ContactPage() {
  return (
    <MarketingPlaceholder
      eyebrow="Contact"
      title={<>Say hi. <em>We read everything.</em></>}
      blurb="Sales, support, partnerships, or just feedback — drop us a line and a real human will reply within one business day."
      bullets={[
        "Sales — sales@creator-os.com",
        "Support — help@creator-os.com",
        "Press — press@creator-os.com",
        "Partnerships — partners@creator-os.com",
      ]}
      primaryCta={{ label: "Email us", to: "mailto:hello@creator-os.com" }}
      secondaryCta={{ label: "Back to home", to: "/" }}
    />
  );
}
