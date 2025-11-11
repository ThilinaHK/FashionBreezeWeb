import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    const totalOrders = await db.collection('orders').countDocuments();
    const totalCustomers = await db.collection('customers').countDocuments();
    const totalProducts = await db.collection('products').countDocuments();
    
    const revenueResult = await db.collection('orders').aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]).toArray();
    const totalRevenue = revenueResult[0]?.total || 0;
    
    const recentOrders = await db.collection('orders')
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();
    
    const topProducts = await db.collection('products')
      .find({})
      .sort({ sales: -1 })
      .limit(5)
      .toArray();

    return NextResponse.json({
      totalOrders,
      totalCustomers,
      totalProducts,
      totalRevenue,
      recentOrders,
      topProducts
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}