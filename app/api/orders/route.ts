import { NextRequest, NextResponse } from 'next/server';

const orders = new Map();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json([]);
  }
  
  const userOrders = Array.from(orders.values()).filter(order => order.userId === userId);
  return NextResponse.json(userOrders);
}

export async function POST(request: NextRequest) {
  try {
    const { userId, customerInfo } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
    }
    
    const orderId = Date.now().toString();
    const order = {
      _id: orderId,
      userId,
      customerInfo,
      items: [],
      total: 0,
      status: 'pending',
      createdAt: new Date()
    };
    
    orders.set(orderId, order);
    
    return NextResponse.json({ success: true, orderId, order });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 });
  }
}