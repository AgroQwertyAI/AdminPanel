import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/util/mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: { chat_id: string } }
) {
  try {
    const {chat_id} = await params;
    const { searchParams } = new URL(request.url);
    
    
    const client = await clientPromise;
    const db = client.db();
    
    const messages = await db.collection("messages")
      .find({ chat_id })
      .sort({ timestamp: 1 })
      .toArray();
    
    return NextResponse.json(messages);
  } catch (error: any) {
    console.error("Failed to fetch messages:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}