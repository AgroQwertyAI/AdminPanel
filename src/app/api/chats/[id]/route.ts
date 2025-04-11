import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/util/mongodb";

// Get chat by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const {id} = await params;
    
    const client = await clientPromise;
    const db = client.db();
    
    const chat = await db.collection("chats").findOne({ chat_id: id });
    
    if (!chat) {
      return NextResponse.json({ 
        error: "Chat not found" 
      }, { status: 404 });
    }
    
    return NextResponse.json(chat);
  } catch (error: any) {
    console.error("Failed to retrieve chat:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update chat active status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const {id} = await params;
    const body = await request.json();
    const {  active } = body;
    
    if (typeof active !== "boolean") {
      return NextResponse.json({ 
        error: " active status are required" 
      }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db();
    
    const result = await db.collection("chats").updateOne(
      { chat_id: id },
      { $set: { active, updated_at: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ 
        error: "Chat not found" 
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      updated: result.modifiedCount > 0
    });
  } catch (error: any) {
    console.error("Failed to update chat:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const {id} = await params;
    
    const client = await clientPromise;
    const db = client.db();
    
    const result = await db.collection("chats").deleteOne({ chat_id: id });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ 
        error: "Chat not found" 
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      deleted: true
    });
  } catch (error: any) {
    console.error("Failed to delete chat:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}