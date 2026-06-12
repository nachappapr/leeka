import { z } from "zod";

const FILTERABLE_STATUSES = ["paid", "sent", "viewed", "overdue", "draft"] as const;

const isoDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD")
  .refine((s) => {
    const [y, m, d] = s.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
  }, "Must be a valid calendar date");

export const ExportCsvQuerySchema = z
  .object({
    statuses: z
      .string()
      .optional()
      .transform((val) => {
        if (!val) return undefined;
        const parts = val
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        const valid = parts.filter((p): p is (typeof FILTERABLE_STATUSES)[number] =>
          (FILTERABLE_STATUSES as ReadonlyArray<string>).includes(p),
        );
        return valid.length > 0 ? valid : undefined;
      }),
    from: isoDateString.optional(),
    to: isoDateString.optional(),
    customer: z.string().trim().min(1).max(200).optional(),
  })
  .refine(
    (data) => {
      if (data.from && data.to) {
        return data.from <= data.to;
      }
      return true;
    },
    { message: "from must be on or before to", path: ["from"] },
  );

export type ExportCsvQuery = z.infer<typeof ExportCsvQuerySchema>;
export type FilterableStatus = (typeof FILTERABLE_STATUSES)[number];
