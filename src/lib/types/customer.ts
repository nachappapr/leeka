export interface Customer {
  id: string
  name: string
  city?: string
  phone: string
  invoiceCount: number
  totalBilled: string
  outstanding: string | null
}
