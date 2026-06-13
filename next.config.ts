import type { NextConfig } from "next";
import NextBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  // Move the dev indicator off the bottom-left, where it overlaps the mobile
  // bottom-sheet footer (a tap on a disabled footer button falls through to
  // the indicator and trips a known Next 16 devtools releasePointerCapture
  // bug). Dev-only; not present in production builds.
  devIndicators: { position: "top-right" },
};

const withBundleAnalyzer = NextBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer(nextConfig);
