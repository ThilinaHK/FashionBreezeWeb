import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import OrderHistory from '../../../lib/models/OrderHistory';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    
    let history;
    if (orderId) {
      history = await OrderHistory.find({ orderId }).sort({ timestamp: -1 }).lean();
    } else {
      history = await OrderHistory.find({}).sort({ timestamp: -1 }).lean();
    }
    
    return NextResponse.json(history);
  } catch (error) {
    console.error('Error loading order history:', error);
    return NextResponse.json([]);
  }
}