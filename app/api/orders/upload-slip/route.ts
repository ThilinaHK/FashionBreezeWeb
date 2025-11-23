import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    console.log('Upload slip API called');
    const body = await request.json();
    console.log('Request body:', { orderId: body.orderId, hasBase64: !!body.base64Data });
    
    const { orderId, base64Data } = body;

    if (!orderId || !base64Data) {
      console.log('Missing fields:', { orderId: !!orderId, base64Data: !!base64Data });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('Connecting to database...');
    await dbConnect();
    console.log('Database connected');
    
    if (!mongoose.connection.db) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    console.log('Updating order:', orderId);
    const result = await mongoose.connection.db.collection('orders').updateOne(
      { _id: new mongoose.Types.ObjectId(orderId) },
      {
        $set: {
          paymentSlip: {
            imageData: base64Data,
            status: 'pending',
            uploadedAt: new Date()
          }
        }
      }
    );
    console.log('Update result:', result);

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Emit real-time notification
    const io = (global as any).io;
    if (io) {
      const order = await mongoose.connection.db.collection('orders').findOne({ _id: new mongoose.Types.ObjectId(orderId) });
      io.emit('paymentSlipUploaded', {
        orderId,
        customerName: order?.customerInfo?.name,
        orderNumber: `FB${String(order?.id || 1).padStart(6, '0')}`,
        timestamp: new Date()
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Upload slip error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Upload failed' }, { status: 500 });
  }
}