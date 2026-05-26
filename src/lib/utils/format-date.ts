import dayjs from "dayjs";

export function formatInvoiceDate(isoDate: string): string {
  return dayjs(isoDate).format("D MMM YYYY");
}
