import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { extractImageFromUrl } from "@/lib/extractImage";
import { imageCache } from "@/lib/cache";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const target = searchParams.get("url");
  if (!target) {
    return NextResponse.json({ error: "Missing url param" }, { status: 400 });
  }
  try {
    const u = new URL(target);
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      return NextResponse.json({ error: "Only http/https supported" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    const cached = imageCache.get(target);
    if (cached) {
      return new NextResponse(
        JSON.stringify({ image: cached.url ?? null, kind: cached.kind ?? null, source: target, cached: true }),
        { headers: { "content-type": "application/json", "cache-control": "public, max-age=300, s-maxage=300" } }
      );
    }
    const result = await extractImageFromUrl(target, 8000);
    if (result.url) {
      imageCache.set(target, { url: result.url, kind: result.kind }, 1000 * 60 * 30); // 30 min TTL
    }
    return new NextResponse(
      JSON.stringify({ image: result.url ?? null, kind: result.kind ?? null, source: target }),
      { headers: { "content-type": "application/json", "cache-control": "public, max-age=300, s-maxage=300" } }
    );
  } catch {
    return NextResponse.json({ error: "Failed to fetch or parse target" }, { status: 502 });
  }
}
