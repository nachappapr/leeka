import { formatPaise } from "@/lib/utils";
import type { ReportsMonthPoint } from "@/lib/types/reports";

interface ReportsChartTableProps {
  months: ReportsMonthPoint[];
}

function formatMonthLabel(yyyyMM: string): string {
  const [year, month] = yyyyMM.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

export function ReportsChartTable({ months }: ReportsChartTableProps) {
  return (
    <table className="sr-only">
      <caption className="sr-only">Monthly revenue and received data</caption>
      <thead>
        <tr>
          <th scope="col">Month</th>
          <th scope="col">Revenue (billed)</th>
          <th scope="col">Received (cash)</th>
        </tr>
      </thead>
      <tbody>
        {months.map((m) => (
          <tr key={m.month}>
            <td>{formatMonthLabel(m.month)}</td>
            <td>{formatPaise(m.revenue)}</td>
            <td>{formatPaise(m.received)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
