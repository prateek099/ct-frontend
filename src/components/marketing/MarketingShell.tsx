import type { ReactNode } from "react";
import MarketingNav from "./MarketingNav";
import MarketingFooter from "./MarketingFooter";
import "./marketing.css";

interface Props {
  children: ReactNode;
}

export default function MarketingShell({ children }: Props) {
  return (
    <div className="cos-page">
      <MarketingNav />
      <main>{children}</main>
      <MarketingFooter />
    </div>
  );
}
