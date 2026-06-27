import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { serverEnv } from "@/lib/env.server";

// Routes that never require authentication
const PUBLIC_ROUTES = ["/auth", "/pay", "/api/pay", "/api/webhooks"];
// Paths to skip entirely (Next.js internals + static files)
const SKIP_PREFIXES = ["/_next", "/favicon.ico", "/robots.txt", "/sitemap.xml"];

function isPublic(pathname: string): boolean {
  return (
    SKIP_PREFIXES.some((p) => pathname.startsWith(p)) ||
    PUBLIC_ROUTES.some((p) => pathname === p || pathname.startsWith(p + "/"))
  );
}

// The downstream trust header. Stripped from every inbound request so a client
// can never spoof it, then re-set only with the server-verified business_id.
const BUSINESS_ID_HEADER = "x-business-id";

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  // Sanitized request headers: drop any client-supplied x-business-id up front.
  // Every NextResponse.next below forwards THESE headers, so an inbound value
  // can never reach a Server Component on any path.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete(BUSINESS_ID_HEADER);

  // Build a mutable response so cookie writes propagate to the browser.
  // IMPORTANT: supabase.auth.getUser() must be called before any early return
  // to ensure the session is refreshed on every request.
  let supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } });

  const supabase = createServerClient(
    serverEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh session — must run on every request, before route guards.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Already-authenticated users have no business on the auth screen — bounce
  // them to the dashboard instead of letting them re-run the OTP flow.
  if (user && (pathname === "/auth" || pathname.startsWith("/auth/"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (isPublic(pathname)) {
    return supabaseResponse;
  }

  // Unauthenticated on a protected route → send to sign-in
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    url.searchParams.set("mode", "signin");
    return NextResponse.redirect(url);
  }

  // Resolve business_id and forward it as a request header so Server Components
  // can read it via headers() without an extra DB call per component. A user
  // mid-onboarding has no membership yet — leave the header absent in that case
  // (it was already stripped above, so nothing spoofed survives).
  const { data: member } = await supabase
    .from("business_members")
    .select("business_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!member?.business_id) {
    return supabaseResponse;
  }

  requestHeaders.set(BUSINESS_ID_HEADER, member.business_id);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  // Carry over any Supabase session cookies onto the new response.
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie.name, cookie.value, cookie);
  });

  return response;
}
