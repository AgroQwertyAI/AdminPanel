import { fetchFromAPI } from '@/app/api/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const source_name = searchParams.get('source_name');
    
    if (!source_name) {
      return NextResponse.json({ error: "source_name parameter is required" }, { status: 400 });
    }
    
    const data = await fetchFromAPI(`/get_active_chats/${source_name}`);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}