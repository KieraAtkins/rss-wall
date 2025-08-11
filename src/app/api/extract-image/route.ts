import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { extractImageFromUrl } from "@/lib/extractImage";

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
    const result = await extractImageFromUrl(target, 8000);
    return NextResponse.json({ image: result.url ?? null, kind: result.kind ?? null, source: target });
  } catch {
    return NextResponse.json({ error: "Failed to fetch or parse target" }, { status: 502 });
  }
}
