export default function OnboardingLoading() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex min-h-svh flex-1 flex-col bg-background"
    >
      <span className="sr-only">Loading…</span>
    </div>
  );
}
