import { NextRequest, NextResponse } from "next/server";

const PUBLIC_MUTATING_ROUTES = [
  "/api/auth/signup",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
];

export async function proxy(request: NextRequest) {
  const method = request.method;
  const path = request.nextUrl.pathname;

  const isAuthPath = path.startsWith("/api/auth/");
  const isPublicPath = path.startsWith("/auth") || path === "/api/health" || path === "/api/csrf" || isAuthPath;

  // ─── Auth Check (for page routes) ──────────────────────────
  if (!isPublicPath && !path.startsWith("/api/")) {
    const sessionCookie = request.cookies.get("next-auth.session-token")?.value
      || request.cookies.get("__Secure-next-auth.session-token")?.value;
    if (!sessionCookie) {
      const signInUrl = new URL("/auth", request.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  // ─── Auth Check (for API routes) ───────────────────────────
  if (!isPublicPath && path.startsWith("/api/")) {
    const sessionCookie = request.cookies.get("next-auth.session-token")?.value
      || request.cookies.get("__Secure-next-auth.session-token")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // ─── CSRF Check ────────────────────────────────────────────
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method) && path.startsWith("/api/")) {
    // Public mutating routes always need CSRF
    if (PUBLIC_MUTATING_ROUTES.includes(path)) {
      const csrfHeader = request.headers.get("x-csrf-token");
      const csrfCookie = request.cookies.get("csrf-token")?.value;
      if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
        return NextResponse.json({ error: "Missing or invalid CSRF token" }, { status: 403 });
      }
      return NextResponse.next();
    }

    // NextAuth internal routes are exempt (they handle their own CSRF)
    if (isAuthPath) {
      return NextResponse.next();
    }

    // For non-auth API routes, check session or CSRF
    const sessionCookie = request.cookies.get("next-auth.session-token")?.value
      || request.cookies.get("__Secure-next-auth.session-token")?.value;

    if (!sessionCookie) {
      const csrfHeader = request.headers.get("x-csrf-token");
      const csrfCookie = request.cookies.get("csrf-token")?.value;
      if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
        return NextResponse.json({ error: "Missing or invalid CSRF token" }, { status: 403 });
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
