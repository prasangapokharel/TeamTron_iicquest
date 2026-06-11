import { MarketingFooter, MarketingHeader } from "./marketing-shell";

export function MarketingPageShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="marketing-page">
      <MarketingHeader />
      <div className="marketing-frame">
        <main className="marketing-main">{children}</main>
        <MarketingFooter />
      </div>
    </div>
  );
}
