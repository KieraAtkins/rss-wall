import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { ServerTimer } from "@/lib/serverTiming";

async function listSources(): Promise<string[]> {
  try {
    if (!sql) return [];
    const rows = await sql<{ name: string }[]>`SELECT name FROM feeds ORDER BY id ASC`;
    return rows.map((r) => r.name);
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  // Basic auth: allow Vercel Cron header, or require CRON_SECRET header when set
  const vercelCron = req.headers.get("x-vercel-cron");
  const secret = process.env.CRON_SECRET;
  const url = new URL(req.url);
  const provided =
    req.headers.get("x-cron-secret") ||
    url.searchParams.get("secret") ||
    (() => {
      const auth = req.headers.get("authorization");
      if (!auth) return null;
      const [scheme, token] = auth.split(" ");
      if (scheme?.toLowerCase() === "bearer") return token || null;
      return null;
    })();

  if (secret) {
    // If a secret is configured, accept any of: Authorization: Bearer <secret>, x-cron-secret header, or ?secret= query.
    if (provided !== secret) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  } else if (!vercelCron) {
    // Without a secret, only allow calls that originate from Vercel Cron (header automatically added).
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const timer = new ServerTimer();
  const endTotal = timer.start("total");

  const origin = url.origin;
  const sp = url.searchParams;
  const og = sp.get("og") ?? undefined; // default off; pass "1" to include
  const limit = sp.get("limit") ?? undefined;
  const ogBudget = sp.get("ogBudget") ?? undefined;
  const includeSources = sp.get("sources") === "1"; // optionally prewarm each source

  const variants: string[] = [];
  {
    const u = new URL("/api/rss", origin);
    if (og) u.searchParams.set("og", og);
    if (limit) u.searchParams.set("limit", limit);
    if (ogBudget) u.searchParams.set("ogBudget", ogBudget);
    variants.push(u.toString());
  }
  if (includeSources) {
    const names = await listSources();
    for (const name of names) {
      const u = new URL("/api/rss", origin);
      u.searchParams.set("source", name);
      if (og) u.searchParams.set("og", og);
      if (limit) u.searchParams.set("limit", limit);
      if (ogBudget) u.searchParams.set("ogBudget", ogBudget);
      variants.push(u.toString());
    }
  }

  const endFetch = timer.start("fetches");
  const res = await Promise.allSettled(
    variants.map(async (v) => {
      try {
        const r = await fetch(v, { method: "GET" });
        return { url: v, ok: r.ok, status: r.status };
      } catch {
        return { url: v, ok: false, status: 0 };
      }
    })
  );
  endFetch(`${variants.length} urls`);
  endTotal();

  const hdr = timer.toHeader();
  return new NextResponse(
    JSON.stringify({ count: variants.length, results: res, variants }),
    { headers: { "content-type": "application/json", ...(hdr ? { "server-timing": hdr } : {}) } }
  );
}
