import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function validateCsrfToken(req: NextRequest): boolean {
  const token = req.headers.get("x-csrf-token");
  const stored = req.cookies.get("csrf-token")?.value;
  if (!token || !stored) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(stored));
  } catch {
    return false;
  }
}

export function setCsrfCookie(res: NextResponse): NextResponse {
  const token = generateCsrfToken();
  res.cookies.set("csrf-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return res;
}

export function withCsrf(handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>) {
  return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
    if (!validateCsrfToken(req)) {
      return NextResponse.json({ error: "Invalid or missing CSRF token" }, { status: 403 });
    }
    return handler(req, ...args);
  };
}
