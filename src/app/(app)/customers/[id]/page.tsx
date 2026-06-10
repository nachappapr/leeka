import { CustomerDetailContainer } from "@/components/customers/customer-detail-container";

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params;
  return <CustomerDetailContainer id={id} />;
}
