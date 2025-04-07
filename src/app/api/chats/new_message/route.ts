import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/util/mongodb";
import { broadcastMessage } from "../stream_messages/route";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      message_id, 
      source_name, 
      chat_id, 
      text, 
      sender_id,
      sender_name, 
      image,
      data 
    } = body;

    if (!message_id || !source_name || !chat_id || !text || !sender_name) {
      return NextResponse.json({ 
        error: "Required fields missing" 
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Check if message already exists
    const existingMessage = await db.collection("messages").findOne({ message_id });
    
    const timestamp = new Date();
    const messageObject = {
      message_id,
      source_name,
      chat_id,
      text,
      sender_id,
      sender_name,
      image,
      data,
      timestamp: existingMessage?.timestamp || timestamp,
      updated_at: timestamp
    };

    // Update or insert the message
    const result = existingMessage 
      ? await db.collection("messages").replaceOne({ message_id }, messageObject)
      : await db.collection("messages").insertOne(messageObject);
    
    // Broadcast message to all SSE clients
    broadcastMessage(messageObject);
    
    return NextResponse.json({
      success: true,
      message_id,
      operation: existingMessage ? "updated" : "created"
    });
  } catch (error: any) {
    console.error("Failed to process new message:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}