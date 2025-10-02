import { NextRequest, NextResponse } from 'next/server';

const carts = new Map();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json({ items: [] });
  }
  
  const cart = carts.get(userId) || { items: [], total: 0 };
  return NextResponse.json(cart);
}

export async function POST(request: NextRequest) {
  try {
    const { userId, items, total } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
    }
    
    carts.set(userId, { items, total, updatedAt: new Date() });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to save cart' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json();
    carts.delete(userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to clear cart' }, { status: 500 });
  }
}