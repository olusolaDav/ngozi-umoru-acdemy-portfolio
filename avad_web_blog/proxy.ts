import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_KEYS, DASHBOARD_HOME_BY_ROLE } from "@/lib/auth-constants";

const authRoutes = [
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/admin/register",
  "/auth/forgot-password",
  "/auth/verify-code",
  "/auth/reset-password",
  "/auth/verify-email",
];

function roleHome(role: string | undefined) {
  if (!role) {
    return "/dashboard";
  }

  return DASHBOARD_HOME_BY_ROLE[role] ?? "/dashboard";
}

function safeNextPath(value: string | null) {
  if (!value) {
    return null;
  }

  if (!value.startsWith("/")) {
    return null;
  }

  if (value.startsWith("//")) {
    return null;
  }

  return value;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(AUTH_COOKIE_KEYS.accessToken)?.value;
  const role = request.cookies.get(AUTH_COOKIE_KEYS.role)?.value;
  const forceChangePassword = request.cookies.get(AUTH_COOKIE_KEYS.forcePasswordChange)?.value === "1";

  if (pathname.startsWith("/community/Thread/")) {
    const nextUrl = request.nextUrl.clone();
    nextUrl.pathname = pathname.replace("/community/Thread/", "/community/thread/");
    return NextResponse.redirect(nextUrl);
  }

  if (forceChangePassword && !pathname.startsWith("/auth/change-password")) {
    return NextResponse.redirect(new URL("/auth/change-password", request.url));
  }

  if (pathname.startsWith("/dashboard")) {
    if (!accessToken) {
      return NextResponse.redirect(new URL("/auth/sign-in", request.url));
    }

    if (role === "MEMBER") {
      return NextResponse.redirect(new URL("/community", request.url));
    }

    if (pathname.startsWith("/dashboard/users/invite") && role !== "ADMIN") {
      return NextResponse.redirect(new URL(roleHome(role), request.url));
    }

    if (pathname.startsWith("/dashboard/users") && role !== "ADMIN" && role !== "MODERATOR") {
      return NextResponse.redirect(new URL(roleHome(role), request.url));
    }

    if (pathname.startsWith("/dashboard/blogs") && role === "MEMBER") {
      return NextResponse.redirect(new URL(roleHome(role), request.url));
    }

    if (pathname.startsWith("/dashboard/videos") && role !== "ADMIN" && role !== "MODERATOR") {
      return NextResponse.redirect(new URL(roleHome(role), request.url));
    }

    if (pathname.startsWith("/dashboard/contacts") && role !== "ADMIN" && role !== "MODERATOR") {
      return NextResponse.redirect(new URL(roleHome(role), request.url));
    }
  }

  if (pathname.startsWith("/notifications")) {
    if (!accessToken) {
      const next = encodeURIComponent(pathname);
      return NextResponse.redirect(new URL(`/auth/sign-in?next=${next}`, request.url));
    }

    if (role && role !== "MEMBER") {
      return NextResponse.redirect(new URL("/dashboard/notifications", request.url));
    }
  }

  if (pathname.startsWith("/profile") || pathname.startsWith("/settings")) {
    if (!accessToken) {
      const next = encodeURIComponent(pathname);
      return NextResponse.redirect(new URL(`/auth/sign-in?next=${next}`, request.url));
    }

    if (role && role !== "MEMBER") {
      const destination = pathname.startsWith("/settings") ? "/dashboard/settings" : roleHome(role);
      return NextResponse.redirect(new URL(destination, request.url));
    }
  }

  if (pathname.startsWith("/auth/change-password")) {
    if (!forceChangePassword) {
      return NextResponse.redirect(new URL("/auth/sign-in", request.url));
    }

    return NextResponse.next();
  }

  if (authRoutes.some((route) => pathname.startsWith(route)) && accessToken) {
    const next = safeNextPath(request.nextUrl.searchParams.get("next"));
    return NextResponse.redirect(new URL(next ?? roleHome(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
