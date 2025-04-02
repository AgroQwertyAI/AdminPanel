import { fetchFromAPI } from '@/app/api/utils';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const data = await fetchFromAPI('/get_datasources');
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}