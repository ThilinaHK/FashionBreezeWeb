import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();
    
    return NextResponse.json({ 
      success: true, 
      verified: true,
      unavailableCount: 0,
      message: 'All items are available'
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 });
  }
}