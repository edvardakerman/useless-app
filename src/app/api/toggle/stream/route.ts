import { addClient, removeClient, startHeartbeat } from "./client";

// Run on the Edge for reliable streaming
export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const { readable, writable } = new TransformStream<string>();
  const writer = writable.getWriter();

  // Flush an initial comment so Safari/iOS establishes the stream immediately
  await writer.write(`: connected\n\n`);

  const id = addClient(writer);

  // Keep connection alive on iOS with a tiny heartbeat from the server
  const hb = startHeartbeat(id, () => writer);

  const abort = (req as any).signal as AbortSignal | undefined;
  const cleanup = () => {
    clearInterval(hb);
    removeClient(id);
    writer.close();
  };
  abort?.addEventListener("abort", cleanup);

  return new Response(readable, {
    headers: {
      // SSE essentials:
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      // If you ever call from another origin, also add:
      // "Access-Control-Allow-Origin": "*"
    },
  });
}