import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Graceful dev-mode bypass: only enforce Clerk auth once real keys are
// configured. Without keys, every request just passes through so the app is
// usable locally before you've set up a Clerk project.
const authConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
);

// The cron route authenticates itself via CRON_SECRET (see
// src/app/api/cron/nudges/route.ts) and must stay reachable without a user
// session. Constructed lazily (only once Clerk is actually configured) to
// avoid createRouteMatcher's deprecation warning firing in the default
// no-auth dev mode.
const isPublicRoute = authConfigured
  ? createRouteMatcher(["/api/cron(.*)"])
  : null;

export default authConfigured
  ? clerkMiddleware(async (auth, req) => {
      if (isPublicRoute?.(req)) return;
      await auth.protect();
    })
  : function noAuthMiddleware() {
      return NextResponse.next();
    };

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)",
    "/(api|trpc)(.*)",
  ],
};
