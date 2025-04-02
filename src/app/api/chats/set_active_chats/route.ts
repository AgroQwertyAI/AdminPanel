import { fetchFromAPI } from '@/app/api/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const data = await fetchFromAPI('/set_active_chats', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}