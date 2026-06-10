import { InvoiceDetailContainer } from "@/components/invoices/invoice-detail-container";

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { id } = await params;
  return <InvoiceDetailContainer id={id} />;
}
