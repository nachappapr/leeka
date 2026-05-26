import { InvoiceEditContainer } from "@/components/invoices/invoice-edit-container"

interface InvoiceEditPageProps {
  params: Promise<{ id: string }>
}

export default async function InvoiceEditPage({ params }: InvoiceEditPageProps) {
  const { id } = await params
  return <InvoiceEditContainer id={id} />
}
