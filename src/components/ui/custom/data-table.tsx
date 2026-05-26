import { cn } from "@/lib/utils"
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/primitives/table"

// ── DataTable compound family ─────────────────────────────────────────────────
// Lekka-branded wrappers over the pristine shadcn Table primitives.
// Each component accepts all props of its underlying primitive; className is
// merged last so call-site overrides win. Documented compound exception to the
// one-per-file rule: all six exports live here for a symmetric import surface.

function DataTable({
  className,
  ...props
}: React.ComponentProps<typeof Table>) {
  return <Table className={cn(className)} {...props} />
}

function DataHeader({
  className,
  ...props
}: React.ComponentProps<typeof TableHeader>) {
  return (
    <TableHeader
      className={cn(
        "[&_tr]:bg-background [&_tr]:hover:bg-background [&_tr]:border-border",
        className
      )}
      {...props}
    />
  )
}

function DataHead({
  className,
  ...props
}: React.ComponentProps<typeof TableHead>) {
  return (
    <TableHead
      scope="col"
      className={cn(
        "text-label font-extrabold uppercase tracking-wide text-ink-3 py-3",
        className
      )}
      {...props}
    />
  )
}

function DataBody({
  ...props
}: React.ComponentProps<typeof TableBody>) {
  return <TableBody {...props} />
}

function DataRow({
  className,
  ...props
}: React.ComponentProps<typeof TableRow>) {
  return (
    <TableRow
      className={cn("cursor-pointer border-border hover:bg-coral/5", className)}
      {...props}
    />
  )
}

function DataCell({
  className,
  ...props
}: React.ComponentProps<typeof TableCell>) {
  return (
    <TableCell className={cn("py-3.5", className)} {...props} />
  )
}

export { DataTable, DataHeader, DataHead, DataBody, DataRow, DataCell }
