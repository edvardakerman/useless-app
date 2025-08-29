import { NextRequest, NextResponse } from "next/server";
import { broadcast } from "./stream/client";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json(); // expects { value: boolean, ... }
    await broadcast({ value: body.value });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
