import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import Cart from '../../lib/models/Cart';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ items: [] });
    }
    
    const cart = await Cart.findOne({ userId }) || { items: [], total: 0 };
    return NextResponse.json(cart);
  } catch (error) {
    return NextResponse.json({ items: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { userId, items, total } = await request.json();
    
    console.log('Cart POST - userId:', userId, 'items:', items?.length);
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
    }
    
    if (!items || items.length === 0) {
      // Allow saving empty cart
      await Cart.findOneAndUpdate(
        { userId },
        { items: [], total: 0 },
        { upsert: true, new: true }
      );
      return NextResponse.json({ success: true });
    }
    
    await Cart.findOneAndUpdate(
      { userId },
      { items, total },
      { upsert: true, new: true }
    );
    
    console.log('Cart saved successfully for userId:', userId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Cart save error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save cart' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const { userId } = await request.json();
    
    await Cart.findOneAndDelete({ userId });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to clear cart' }, { status: 500 });
  }
}