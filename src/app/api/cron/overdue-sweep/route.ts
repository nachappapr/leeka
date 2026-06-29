import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidateBusiness } from "@/lib/cache/revalidate-business";
import logger from "@/lib/logger";
import type { SweepOverdueRow } from "@/lib/types/lifecycle";

// PRD §6.2: POST /api/cron/overdue-sweep — flip sent/viewed → overdue past due date.
// PLATFORM NOTE (DEVIATION): Vercel Cron invokes via GET. Both GET and POST are exported
// here and share the same guarded handler. See DEVIATIONS in the AP-20 delivery note.

function missingSecret(): Response {
  return Response.json({ ok: false }, { status: 401 });
}

async function runSweep(request: Request): Promise<Response> {
  // ── Auth guard: CRON_SECRET bearer token ──────────────────────────────────
  // Missing or mismatched secret → 401 with no detail leak.
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  if (!secret || !authHeader || authHeader !== `Bearer ${secret}`) {
    return missingSecret();
  }

  // ── Call the sweep RPC via service-role admin client ─────────────────────
  // The admin client bypasses RLS, which is required for this background job
  // (no auth.uid() in cron context). It is server-only and never reachable
  // from the browser (admin.ts imports "server-only").
  const admin = createAdminClient();

  const { data, error } = await admin.rpc("sweep_overdue_invoices");

  if (error) {
    logger.error(
      { err: { code: error.code, message: error.message } },
      "overdue-sweep: RPC failed",
    );
    return Response.json({ ok: false }, { status: 500 });
  }

  const row = data as unknown as SweepOverdueRow;

  logger.info(
    { swept_count: row.swept_count, invoice_ids: row.invoice_ids },
    "overdue-sweep: completed",
  );

  // Invalidate cache for each business whose invoices transitioned to overdue.
  // Scoped to affected businesses only — no invalidation when nothing swept.
  //
  // Deliberately does NOT invalidate the public pay page's `pay-${token}` tag
  // (see issue #15): that read tolerates up to 60s of stale status via its
  // cacheLife revalidate. The window is bounded, status-only, and the payment
  // flow itself is unaffected — not worth threading per-token invalidation
  // through the RPC, the type, and this loop.
  for (const businessId of row.business_ids) {
    revalidateBusiness(businessId);
  }

  return Response.json({ ok: true, swept: row.swept_count });
}

export async function POST(request: Request): Promise<Response> {
  return runSweep(request);
}

// Vercel Cron fires HTTP GET. This handler runs the identical guarded logic.
// The Vercel Cron scheduler injects the CRON_SECRET in the Authorization header
// when configured in vercel.json — no separate secret management required.
export async function GET(request: Request): Promise<Response> {
  return runSweep(request);
}
