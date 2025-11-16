import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';

export async function GET() {
  try {
    await dbConnect();
    
    const db = (global as any).mongoose.connection.db;
    
    const statusSummary = await db.collection('orders').aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).toArray();
    
    const recentOrders = await db.collection('orders').find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();
    
    return NextResponse.json({
      statusSummary,
      recentOrders
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders report' }, { status: 500 });
  }
}