import "server-only";
import { cacheLife, cacheTag } from "next/cache";

import { createPublicClient } from "@/lib/pay/public-client";
import logger from "@/lib/logger";

// Cached public-invoice read for the pay surface. The public client is
// cookie-less, so the only cache-key input is the token — keeping this in the
// static shell instead of forcing the whole page dynamic. cacheLife preserves
// the prior `revalidate = 60` ISR TTL: the idempotent viewed-event inside
// get_public_invoice (fires only when viewed_at IS NULL) still runs once per
// 60-second revalidation, matching the previous behaviour. Returns null on
// error or missing invoice; the caller maps that to notFound().
export async function getPublicInvoice(token: string): Promise<unknown> {
  "use cache";
  cacheLife({ revalidate: 60 });
  cacheTag(`pay-${token}`);

  const supabase = createPublicClient();

  const { data, error } = await supabase.rpc("get_public_invoice", {
    p_token: token,
  });

  if (error) {
    logger.error({ err: { code: error.code } }, "getPublicInvoice: RPC error");
    return null;
  }

  return data;
}
