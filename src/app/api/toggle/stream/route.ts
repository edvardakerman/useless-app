type Client = {
  id: number;
  writer: WritableStreamDefaultWriter<string>;
};

let clients: Client[] = [];

export async function GET(req: Request) {
  const { readable, writable } = new TransformStream<string>();
  const writer = writable.getWriter();

  const clientId = Date.now();
  clients.push({ id: clientId, writer });

  // Remove client on disconnect
  req.signal.addEventListener("abort", () => {
    clients = clients.filter(c => c.id !== clientId);
    writer.close();
  });

  // Set headers for SSE
  const headers = new Headers({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  });

  return new Response(readable, { headers });
}

// Helper to send updates to all clients
export function sendUpdate(data: unknown) {
  clients.forEach(client => {
    client.writer.write(`data: ${JSON.stringify(data)}\n\n`);
  });
}
