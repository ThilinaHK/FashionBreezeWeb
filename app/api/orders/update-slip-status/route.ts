import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import mongoose from 'mongoose';

export async function PUT(request: NextRequest) {
  try {
    const { orderId, status } = await request.json();

    await dbConnect();
    
    const updateData: any = {
      'paymentSlip.status': status,
      'paymentSlip.verifiedAt': new Date()
    };
    
    // If payment slip is verified, change order status to shipped
    if (status === 'verified') {
      updateData.status = 'shipped';
    }
    
    if (!mongoose.connection.db) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const result = await mongoose.connection.db.collection('orders').updateOne(
      { _id: new mongoose.Types.ObjectId(orderId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Get order details for notification
    const order = await mongoose.connection.db.collection('orders').findOne({ _id: new mongoose.Types.ObjectId(orderId) });
    
    // Emit real-time notification
    const io = (global as any).io;
    if (io && order) {
      io.emit('paymentSlipStatusChanged', {
        orderId,
        status,
        customerEmail: order.customerInfo?.email,
        orderNumber: `FB${String(order.id || 1).padStart(6, '0')}`,
        timestamp: new Date()
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update slip status error:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}