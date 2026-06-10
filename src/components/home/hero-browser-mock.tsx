import { BrowserChrome } from "@/components/home/browser-chrome";
import { BrowserSidebar } from "@/components/home/hero-browser-sidebar";
import { BrowserDashboardMain } from "@/components/home/hero-browser-dashboard-main";

function HeroBrowserMock() {
  return (
    <div aria-hidden="true" className="relative w-full">
      {/* Rotated background card */}
      <div className="absolute -inset-5 -rotate-2 rounded-3xl bg-linear-to-br from-coral-soft via-coral-soft/80 to-coral/40 -z-10" />

      {/* Browser shell */}
      <div className="relative z-10 overflow-hidden rounded-2xl border border-border bg-card shadow-float">
        <BrowserChrome host="app.arthapatra.in" path="/dashboard" />
        {/* Body */}
        <div className="grid min-h-115 max-mobile:min-h-0 grid-cols-[188px_1fr] max-mobile:grid-cols-1">
          <BrowserSidebar />
          <BrowserDashboardMain />
        </div>
      </div>
    </div>
  );
}

export { HeroBrowserMock };
