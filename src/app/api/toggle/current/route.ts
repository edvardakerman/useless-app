import { NextResponse } from "next/server";

export async function GET() {
  try {
    const url = process.env.GET_URL;

    if (!url) {
      return NextResponse.json(
        { error: "GET_URL not configured" },
        { status: 500 }
      );
    }

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream request failed with status ${res.status}` },
        { status: 500 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error fetching toggle:", err);
    return NextResponse.json({ error: "Failed to fetch toggle" }, { status: 500 });
  }
}