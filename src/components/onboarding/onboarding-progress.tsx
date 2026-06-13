function OnboardingProgress() {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="size-2 rounded-full bg-coral opacity-40" aria-hidden="true" />
      <span className="size-2 rounded-full bg-coral opacity-40" aria-hidden="true" />
      <span className="h-2 w-6 rounded-sm bg-coral" aria-hidden="true" />
      <span className="ml-1 text-label font-bold uppercase tracking-wide text-ink-3">
        Step 3 of 3
      </span>
    </div>
  );
}

export { OnboardingProgress };
