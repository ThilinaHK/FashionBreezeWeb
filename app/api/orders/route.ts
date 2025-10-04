import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import Order from '../../lib/models/Order';
import OrderHistory from '../../lib/models/OrderHistory';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    let orders;
    if (userId) {
      orders = await Order.find({ userId }).sort({ createdAt: -1 }).lean();
    } else {
      orders = await Order.find({}).sort({ createdAt: -1 }).lean();
    }
    
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error loading orders:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { userId, customerInfo, paymentMethod, paymentStatus } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
    }
    
    // Get cart items from MongoDB
    const Cart = require('../../lib/models/Cart').default;
    const cart = await Cart.findOne({ userId });
    
    if (!cart || !cart.items || cart.items.length === 0) {
      return NextResponse.json({ success: false, error: 'Cart is empty' }, { status: 400 });
    }
    
    // Auto-generate order number and ID
    const lastOrder = await Order.findOne().sort({ id: -1 }).select('id');
    const orderId = lastOrder ? lastOrder.id + 1 : 1;
    const orderNumber = `FB${orderId.toString().padStart(6, '0')}`;
    
    const order = await Order.create({
      id: orderId,
      orderNumber,
      userId,
      customerInfo,
      items: cart.items,
      total: cart.total,
      status: 'pending',
      paymentMethod: paymentMethod || 'cash_on_delivery',
      paymentStatus: paymentStatus || 'pending'
    });
    
    return NextResponse.json({ success: true, orderId: order._id, order });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const { orderId, status, isActive, paymentStatus, paymentMethod } = await request.json();
    const userId = request.headers.get('x-user-id');
    const username = request.headers.get('x-user-name');
    
    // Find existing order first
    let existingOrder = await Order.findById(orderId);
    if (!existingOrder) {
      const numericId = parseInt(orderId);
      if (!isNaN(numericId)) {
        existingOrder = await Order.findOne({ id: numericId });
      }
    }
    if (!existingOrder) {
      existingOrder = await Order.findOne({ orderNumber: orderId });
    }
    
    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    
    // Track status change in history
    if (status !== undefined && status !== existingOrder.status) {
      await OrderHistory.create({
        orderId: existingOrder._id,
        previousStatus: existingOrder.status,
        newStatus: status,
        changedBy: {
          userId: userId || 'system',
          username: username || 'System'
        },
        timestamp: new Date()
      });
    }
    
    const order = await Order.findByIdAndUpdate(existingOrder._id, updateData, { new: true });
    
    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error('Order update error:', error);
    return NextResponse.json({ error: 'Failed to update order: ' + error.message }, { status: 500 });
  }
}

