import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import Order from '../../../lib/models/Order';

export async function GET() {
  try {
    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Today's data
    const todayOrders = await Order.find({
      createdAt: { $gte: today },
      status: { $nin: ['cancelled'] }
    });

    // Yesterday's data
    const yesterdayOrders = await Order.find({
      createdAt: { $gte: yesterday, $lt: today },
      status: { $nin: ['cancelled'] }
    });

    // Last 7 days data
    const weekOrders = await Order.find({
      createdAt: { $gte: lastWeek },
      status: { $nin: ['cancelled'] }
    });

    // Last 30 days data
    const monthOrders = await Order.find({
      createdAt: { $gte: lastMonth },
      status: { $nin: ['cancelled'] }
    });

    // Calculate totals
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const yesterdayRevenue = yesterdayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const weekRevenue = weekOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const monthRevenue = monthOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    const todayProductsSold = todayOrders.reduce((sum, order) => 
      sum + order.items.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0), 0
    );

    const yesterdayProductsSold = yesterdayOrders.reduce((sum, order) => 
      sum + order.items.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0), 0
    );

    return NextResponse.json({
      today: {
        orders: todayOrders.length,
        revenue: todayRevenue,
        productsSold: todayProductsSold
      },
      yesterday: {
        orders: yesterdayOrders.length,
        revenue: yesterdayRevenue,
        productsSold: yesterdayProductsSold
      },
      week: {
        orders: weekOrders.length,
        revenue: weekRevenue
      },
      month: {
        orders: monthOrders.length,
        revenue: monthRevenue
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}