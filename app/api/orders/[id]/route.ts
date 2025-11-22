import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Order from '../../../lib/models/Order';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const data = await request.json();
    
    // Get the current order to check status change
    const currentOrder = await Order.findById(params.id);
    if (!currentOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    const order = await Order.findByIdAndUpdate(
      params.id,
      data,
      { new: true }
    );
    
    // Send email and notification if status changed
    if (data.status && data.status !== currentOrder.status) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      
      // Send email
      try {
        await fetch(`${baseUrl}/api/email/order-status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order._id,
            customerEmail: order.customerInfo?.email,
            customerName: order.customerInfo?.name,
            newStatus: data.status,
            oldStatus: currentOrder.status
          })
        });
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError);
      }
      
      // Create notification
      try {
        await fetch(`${baseUrl}/api/notifications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: order.customerInfo?.email || order.customerInfo?.phone,
            type: 'order_status',
            title: 'Order Status Updated',
            message: `Your order #${order._id.toString().slice(-6)} status changed to ${data.status}`,
            orderId: order._id
          })
        });
      } catch (notificationError) {
        console.error('Failed to create notification:', notificationError);
      }
    }
    
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const order = await Order.findByIdAndDelete(params.id);
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}