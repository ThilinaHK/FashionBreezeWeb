import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Order from '../../../lib/models/Order';
import OrderHistory from '../../../lib/models/OrderHistory';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { orderId, verified, customerNotes } = await request.json();
    
    console.log('Verifying delivery for order:', orderId);
    
    const updateData = {
      deliveryVerified: verified,
      customerNotes: customerNotes,
      verifiedAt: new Date(),
      ...(verified && { status: 'customer_verified' })
    };
    
    let order = await Order.findByIdAndUpdate(orderId, updateData, { new: true });
    
    // If not found by _id, try by custom id field
    if (!order) {
      const numericId = parseInt(orderId);
      if (!isNaN(numericId)) {
        order = await Order.findOneAndUpdate({ id: numericId }, updateData, { new: true });
      }
    }
    
    if (!order) {
      console.log('Order not found with ID:', orderId);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    console.log('Order updated successfully:', order._id);
    
    // Add to history
    await OrderHistory.create({
      orderId: order._id,
      previousStatus: 'delivered',
      newStatus: verified ? 'customer_verified' : 'delivery-issue',
      changedBy: {
        userId: 'customer',
        username: 'Customer'
      },
      reason: customerNotes || (verified ? 'Delivery confirmed by customer' : 'Delivery issue reported'),
      timestamp: new Date()
    });
    
    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error('Delivery verification error:', error);
    const { orderId, verified, customerNotes } = await request.json();
    console.log('Request data:', { orderId, verified, customerNotes });
    return NextResponse.json({ error: 'Failed to verify delivery' }, { status: 500 });
  }
}