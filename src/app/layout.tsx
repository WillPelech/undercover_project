import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, SignInButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reel PM — Production Project Manager",
  description: "Internal project manager for video production kickoff-to-delivery.",
};

const authConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
);

async function AuthStatus() {
  if (!authConfigured) {
    return (
      <span
        title="Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY to enable sign-in"
        className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800"
      >
        Dev mode — auth not configured
      </span>
    );
  }
  const { userId } = await auth();
  return userId ? <UserButton /> : <SignInButton mode="modal" />;
}

function Chrome({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900">
        <header className="border-b border-neutral-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              Reel PM
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/" className="text-neutral-600 hover:text-neutral-900">
                Dashboard
              </Link>
              <Link
                href="/projects/new"
                className="rounded-md bg-neutral-900 px-3 py-1.5 text-white hover:bg-neutral-700"
              >
                New Project
              </Link>
              <AuthStatus />
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  if (!authConfigured) return <Chrome>{children}</Chrome>;
  return (
    <ClerkProvider>
      <Chrome>{children}</Chrome>
    </ClerkProvider>
  );
}
