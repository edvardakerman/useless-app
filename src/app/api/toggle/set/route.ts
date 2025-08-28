import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { value } = await req.json(); // expects { value: true/false }

    const res = await fetch(process.env.AZURE_TOGGLE_URL as string, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-functions-key": process.env.AZURE_TOGGLE_KEY as string,
      },
      body: JSON.stringify({
        id: "1",        // Hardcoded as in your curl
        toggleId: "1",  // Hardcoded as in your curl
        value,          // From request
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: text }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Error in toggle/set route:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
