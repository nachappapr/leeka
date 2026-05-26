// Server Component — no "use client"
import { Sidebar } from "@/components/ui/custom/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex flex-1 flex-col min-w-0">{children}</main>
    </div>
  )
}
