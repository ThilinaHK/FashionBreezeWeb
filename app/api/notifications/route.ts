import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Notification from '../../../lib/models/Notification';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    
    const notification = new Notification({
      userId: data.userId,
      type: data.type || 'order_status',
      title: data.title,
      message: data.message,
      orderId: data.orderId,
      isRead: false,
      createdAt: new Date()
    });
    
    await notification.save();
    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);
    
    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}