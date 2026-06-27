import "server-only";
import { updateTag } from "next/cache";
import { dashboardTag, invoicesTag } from "@/lib/constants/cache-tags";

export function revalidateBusiness(businessId: string): void {
  updateTag(dashboardTag(businessId));
  updateTag(invoicesTag(businessId));
}
