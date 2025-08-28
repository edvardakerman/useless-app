import { sendUpdate } from "./stream/route";

export async function POST(req: Request) {
  const { toggleId, value } = await req.json();

  // Optionally, save or process toggle here

  // Notify all connected clients
  sendUpdate({ toggleId, value });

  return new Response(JSON.stringify({ message: "Update sent" }), {
    status: 200,
  });
}
