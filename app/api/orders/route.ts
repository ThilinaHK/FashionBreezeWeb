import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import Order from '../../lib/models/Order';

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
    const { userId, customerInfo } = await request.json();
    
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
      status: 'pending'
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
    const { orderId, status } = await request.json();
    
    let order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    
    if (!order) {
      order = await Order.findOneAndUpdate({ id: parseInt(orderId) }, { status }, { new: true });
    }
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}