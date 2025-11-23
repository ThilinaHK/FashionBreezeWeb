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
      
      // If no history found for this order, create a basic entry from the order itself
      if (history.length === 0) {
        const Order = require('../../../lib/models/Order').default;
        const order = await Order.findById(orderId);
        if (order) {
          const basicHistory = {
            orderId: order._id,
            previousStatus: 'none',
            newStatus: order.status || 'pending',
            changedBy: {
              userId: 'system',
              username: 'System'
            },
            timestamp: order.createdAt || new Date()
          };
          
          // Save to database for future use
          try {
            await OrderHistory.create(basicHistory);
            history = [basicHistory];
          } catch (saveError) {
            // If save fails, still return the basic history
            history = [basicHistory];
          }
        }
      }
    } else {
      history = await OrderHistory.find({}).sort({ timestamp: -1 }).lean();
    }
    
    return NextResponse.json(history);
  } catch (error) {
    console.error('Error loading order history:', error);
    return NextResponse.json([]);
  }
}