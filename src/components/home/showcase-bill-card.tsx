interface ShowcaseBillCardProps {
  nameHi: string;
  amount: string;
  statusClass: string;
  dotClass: string;
  statusHi: string;
}

function ShowcaseBillCard({
  nameHi,
  amount,
  statusClass,
  dotClass,
  statusHi,
}: ShowcaseBillCardProps) {
  return (
    <div className="bg-card rounded-xl px-3 py-2.5 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-12 font-bold">
          <span lang="hi">{nameHi}</span>
        </span>
        <span className="tabular text-12 font-extrabold">{amount}</span>
      </div>
      <div className="mt-1">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-1.5 py-px text-9 font-extrabold ${statusClass}`}
        >
          <span className={`size-1 rounded-full ${dotClass}`} />
          <span lang="hi">{statusHi}</span>
        </span>
      </div>
    </div>
  );
}

export { ShowcaseBillCard };
export type { ShowcaseBillCardProps };
