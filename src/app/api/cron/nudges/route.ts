import { NextRequest, NextResponse } from "next/server";
import { generateOverdueNudges } from "@/lib/nudges";

// Vercel Cron Jobs call this route on a schedule (see vercel.json) and send
// `Authorization: Bearer $CRON_SECRET` automatically when CRON_SECRET is set
// as an env var. Requests without the correct secret are rejected. If
// CRON_SECRET isn't configured yet, the route runs without checking auth
// (fine for local dev, not for production).
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const result = await generateOverdueNudges();
  return NextResponse.json({ ok: true, ...result });
}
