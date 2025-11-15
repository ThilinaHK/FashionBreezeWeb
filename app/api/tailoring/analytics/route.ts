import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    
    const matchStage: any = {};
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);
      matchStage.createdAt = { $gte: startDate, $lte: endDate };
    }
    
    const [orderStats, topDesigns, revenueData] = await Promise.all([
      // Order statistics
      db.collection('tailoring_orders').aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            pendingOrders: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            completedOrders: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
            avgDeliveryTime: { $avg: '$deliveryTime' }
          }
        }
      ]).toArray(),
      
      // Top designs
      db.collection('tailoring_orders').aggregate([
        { $match: matchStage },
        { $group: { _id: '$designName', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]).toArray(),
      
      // Revenue by month
      db.collection('tailoring_orders').aggregate([
        { $match: { status: 'delivered' } },
        {
          $group: {
            _id: { 
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ]).toArray()
    ]);
    
    return NextResponse.json({
      orderStats: orderStats[0] || { totalOrders: 0, pendingOrders: 0, completedOrders: 0 },
      topDesigns,
      revenueData
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}