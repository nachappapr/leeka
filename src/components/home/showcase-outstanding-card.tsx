function ShowcaseOutstandingCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-coral to-coral-press text-card p-3 px-3.5">
      <div className="absolute -right-5 -top-5 size-22 rounded-full bg-card/12" />
      <div className="relative text-10 font-extrabold uppercase tracking-wide opacity-90">
        <span lang="hi">कुल बकाया</span>
      </div>
      <div className="relative mt-1 tabular text-26 font-extrabold tracking-tight leading-none">
        ₹26,400
      </div>
      <div className="relative mt-2 inline-flex items-center gap-1 rounded-full bg-ink/20 px-2 py-0.5 text-10 font-bold">
        <span lang="hi">4 बकाया</span>
      </div>
    </div>
  );
}

export { ShowcaseOutstandingCard };
