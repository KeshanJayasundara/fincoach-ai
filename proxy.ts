import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const onboardingDone = req.auth?.user?.onboardingDone;

  const isAuthPage =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register") ||
    nextUrl.pathname.startsWith("/forgot-password");

  const isOnboardingPage = nextUrl.pathname.startsWith("/onboarding");
  const isDashboardPage = nextUrl.pathname.startsWith("/dashboard");

  // Not logged in and trying to reach a protected page → send to login
  if ((isDashboardPage || isOnboardingPage) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Already logged in and visiting an auth page → send to dashboard
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Logged in but hasn't finished onboarding and tries to reach dashboard → send to onboarding
  if (isDashboardPage && isLoggedIn && !onboardingDone) {
    return NextResponse.redirect(new URL("/onboarding", nextUrl));
  }

  // Already onboarded and tries to revisit onboarding → send to dashboard
  if (isOnboardingPage && isLoggedIn && onboardingDone) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/onboarding",
  ],
};