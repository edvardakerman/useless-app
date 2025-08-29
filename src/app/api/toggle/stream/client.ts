type Client = {
  id: number;
  writer: WritableStreamDefaultWriter<string>;
};

const clients = new Map<number, Client>();

export function addClient(writer: WritableStreamDefaultWriter<string>) {
  const id = Date.now() + Math.floor(Math.random() * 1000);
  clients.set(id, { id, writer });
  return id;
}

export function removeClient(id: number) {
  clients.delete(id);
}

export async function broadcast(data: unknown) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const { id, writer } of clients.values()) {
    try {
      await writer.write(payload);
    } catch {
      // writer closed; drop client
      clients.delete(id);
    }
  }
}

// Small server-side heartbeat to keep iOS Safari (and some proxies) from closing the stream.
// This is NOT client polling; it's just keeping the single open HTTP response alive.
export function startHeartbeat(
  id: number,
  getWriter: () => WritableStreamDefaultWriter<string> | null,
  ms = 15000
) {
  const t = setInterval(async () => {
    const w = getWriter();
    if (!w) return clearInterval(t);
    try {
      await w.write(`:\n\n`); // SSE comment line
    } catch {
      clearInterval(t);
      removeClient(id);
    }
  }, ms);
  return t;
}