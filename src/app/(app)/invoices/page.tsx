import { InvoicesContainer } from "@/components/invoices/invoices-container";

interface InvoicesPageProps {
  searchParams: Promise<{ filter?: string }>;
}

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
  const { filter } = await searchParams;
  return <InvoicesContainer initialFilter={filter} />;
}
