import { fetchFromAPI } from '@/app/api/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const chat_id = searchParams.get('chat_id');
    
    if (!chat_id) {
      return NextResponse.json({ error: "chat_id parameter is required" }, { status: 400 });
    }
    
    const data = await fetchFromAPI(`/get_processed_messages/${chat_id}`);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}