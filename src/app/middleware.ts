import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const user = req.cookies.get("autobridge_user");

  const path = req.nextUrl.pathname;

  // simple protection rules
  if (path.startsWith("/dashboard") && !user) {
    return NextResponse.redirect(new URL("/account", req.url));
  }

  if (path.startsWith("/admin") && !user) {
    return NextResponse.redirect(new URL("/account", req.url));
  }

  return NextResponse.next();
}