import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const isAdminPage = req.nextUrl.pathname.startsWith("/admin");
  if (!isAdminPage) return NextResponse.next();

  const loggedIn = req.cookies.get("admin-auth")?.value === "true";

  if (!loggedIn) {
    const loginUrl = new URL("/admin-login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
