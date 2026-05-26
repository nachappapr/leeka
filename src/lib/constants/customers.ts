import type { Customer } from "@/lib/types"

export const CUSTOMERS: ReadonlyArray<Customer> = [
  { id: "C001", name: "Sharma Sweets",   phone: "+91 98XXX 12345", invoiceCount: 4, totalBilled: "₹18,200", outstanding: "₹4,725" },
  { id: "C002", name: "Rohit Kumar",     phone: "+91 98XXX 22113", invoiceCount: 2, totalBilled: "₹3,400",  outstanding: null     },
  { id: "C003", name: "Krishna General", phone: "+91 99XXX 56789", invoiceCount: 8, totalBilled: "₹52,300", outstanding: null     },
  { id: "C004", name: "Anita Tailoring", phone: "+91 95XXX 88891", invoiceCount: 3, totalBilled: "₹7,200",  outstanding: "₹2,400" },
  { id: "C005", name: "Modern Bakers",   phone: "+91 90XXX 12233", invoiceCount: 5, totalBilled: "₹22,100", outstanding: "₹6,300" },
  { id: "C006", name: "M. Iqbal & Sons", phone: "+91 99XXX 44556", invoiceCount: 2, totalBilled: "₹1,700",  outstanding: null     },
]
