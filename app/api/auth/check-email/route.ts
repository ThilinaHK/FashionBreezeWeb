import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    return NextResponse.json({ exists: false, available: true });
  } catch (error) {
    return NextResponse.json({ error: 'Check failed' }, { status: 500 });
  }
}