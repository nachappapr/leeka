import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { serverEnv } from "@/lib/env.server";

// Routes that never require authentication
const PUBLIC_ROUTES = ["/auth", "/api/pay", "/api/webhooks"];
// Static/internal paths to skip entirely
const SKIP_PREFIXES = ["/_next", "/favicon.ico", "/robots.txt", "/sitemap.xml"];

function isPublic(pathname: string): boolean {
  return (
    SKIP_PREFIXES.some((p) => pathname.startsWith(p)) ||
    PUBLIC_ROUTES.some((p) => pathname === p || pathname.startsWith(p + "/"))
  );
}

export async function middleware(request: NextRequest) {
  // Build a mutable response so cookie writes propagate to the browser.
  // IMPORTANT: supabase.auth.getUser() must be called before any early return
  // to ensure the session is refreshed on every request. Do not add logic
  // between createServerClient and getUser().
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    serverEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write updated cookies to both the forwarded request and the response
          // so the refreshed session reaches both the RSC render and the browser.
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh session — must run on every request.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Allow public routes regardless of auth state
  if (isPublic(pathname)) {
    return response;
  }

  // Unauthenticated on a protected route → send to sign-in
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    url.searchParams.set("mode", "signin");
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except Next.js internals and static files.
     * The SKIP_PREFIXES check inside the middleware handles finer-grained
     * exclusions (/_next/static, /_next/image, favicon, etc.).
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
