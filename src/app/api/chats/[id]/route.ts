import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/util/mongodb";

// Update chat active status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const { source_name, active } = body;
    
    if (!source_name || typeof active !== "boolean") {
      return NextResponse.json({ 
        error: "source_name and active status are required" 
      }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db();
    
    const result = await db.collection("chats").updateOne(
      { chat_id: id, source_name },
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