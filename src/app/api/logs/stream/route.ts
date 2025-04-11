import { NextRequest } from 'next/server';

// Map to store connected clients
const clients = new Set<{
  id: string;
  controller: ReadableStreamDefaultController;
}>();

// Function to send log to all connected clients
export function sendLogToClients(log: any) {
  clients.forEach(client => {
    try {
      const data = `data: ${JSON.stringify(log)}\n\n`;
      client.controller.enqueue(data);
    } catch (error) {
      console.error("Error sending log to client:", error);
    }
  });
}

export async function GET(req: NextRequest) {
  const clientId = crypto.randomUUID();
  
  // Create a new ReadableStream
  const stream = new ReadableStream({
    start(controller) {
      clients.add({ id: clientId, controller });
      
      // Send initial connection message
      controller.enqueue('data: {"connected":true}\n\n');
      
      // Keep connection alive with comment every 30 seconds
      const keepAliveInterval = setInterval(() => {
        controller.enqueue(': keepalive\n\n');
      }, 30000);
      
      // Clean up when client disconnects
      req.signal.addEventListener('abort', () => {
        clearInterval(keepAliveInterval);
        clients.delete(clients.values().next().value);
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}