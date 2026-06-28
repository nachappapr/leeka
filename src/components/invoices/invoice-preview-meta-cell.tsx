interface InvoicePreviewMetaCellProps {
  label: string;
  primary: string;
  secondary?: string;
  secondaryClassName?: string;
  primaryDateTime?: string;
  className?: string;
}

export function InvoicePreviewMetaCell({
  label,
  primary,
  secondary,
  secondaryClassName = "text-ink-2",
  primaryDateTime,
  className,
}: InvoicePreviewMetaCellProps) {
  return (
    <div className={className}>
      <div className="text-kicker uppercase text-ink-3">{label}</div>
      {primaryDateTime ? (
        <time dateTime={primaryDateTime} className="mt-1.5 block text-body font-bold text-ink">
          {primary}
        </time>
      ) : (
        <div className="mt-1.5 text-body font-bold text-ink">{primary}</div>
      )}
      {secondary && <div className={`text-caption ${secondaryClassName}`}>{secondary}</div>}
    </div>
  );
}
