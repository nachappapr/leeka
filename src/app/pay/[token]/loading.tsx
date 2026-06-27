export default function PayLoading() {
  return (
    <div
      role="status"
      aria-label="Loading invoice"
      className="flex min-h-screen flex-col bg-background"
    >
      <span className="sr-only">Loading…</span>
    </div>
  );
}
