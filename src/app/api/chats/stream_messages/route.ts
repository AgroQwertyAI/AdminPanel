import { NextRequest } from "next/server";

// Store active connections with unique IDs
let clientIdCounter = 0;
const clients = new Map<number, ReadableStreamDefaultController<any>>();

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  const clientId = clientIdCounter++;
  
  console.log(`[SSE] New client connected: ${clientId}. Total clients: ${clients.size + 1}`);

  // Create a new readable stream
  const stream = new ReadableStream({
    start(controller) {
      // Add this client to the map of connections
      clients.set(clientId, controller);

      // Send initial connection message
      const data = encoder.encode(`data: ${JSON.stringify({ 
        type: "connection_established", 
        clientId,
        timestamp: new Date().toISOString() 
      })}\n\n`);
      controller.enqueue(data);
      
      // Remove client when connection closes
      request.signal.addEventListener("abort", () => {
        clients.delete(clientId);
        console.log(`[SSE] Client ${clientId} disconnected. Remaining clients: ${clients.size}`);
      });
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*"
    }
  });
}

// Send heartbeat to all clients periodically to keep connections alive
setInterval(() => {
  const timestamp = new Date().toISOString();
  console.log(`[SSE] Sending heartbeat to ${clients.size} clients`);
  
  broadcastMessage({
    type: "heartbeat",
    timestamp
  });
}, 30000); // Every 30 seconds

// Helper function to broadcast messages to all clients
export function broadcastMessage(message: any) {
  const encoder = new TextEncoder();
  const data = encoder.encode(`data: ${JSON.stringify(message)}\n\n`);
  
  // Create a copy of client entries to avoid issues if the map changes during iteration
  const clientEntries = Array.from(clients.entries());
  console.log(JSON.stringify(message));
  console.log(`[SSE] Broadcasting to ${clientEntries.length} clients`);
  
  for (const [clientId, controller] of clientEntries) {
    try {
      controller.enqueue(data);
    } catch (error) {
      console.error(`[SSE] Error broadcasting to client ${clientId}:`, error);
      
      // Remove failed client
      clients.delete(clientId);
    }
  }
}