import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import Cart from '../../lib/models/Cart';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) return NextResponse.json({ items: [], total: 0 });
    
    try {
      await dbConnect();
      const cart = await Cart.findOne({ userId });
      return NextResponse.json(cart || { items: [], total: 0 });
    } catch (dbError) {
      return NextResponse.json({ items: [], total: 0 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, items, total } = await request.json();
    
    try {
      await dbConnect();
      const cart = await Cart.findOneAndUpdate(
        { userId },
        { items, total },
        { upsert: true, new: true }
      );
      return NextResponse.json(cart);
    } catch (dbError) {
      return NextResponse.json({ success: true, items, total });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save cart' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { MongoClient } = require('mongodb');
  let client;
  
  try {
    const { userId } = await request.json();
    console.log('Clearing cart for userId:', userId);
    
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    client = new MongoClient(mongoUri);
    await client.connect();
    
    const db = client.db('fashionBreeze');
    const result = await db.collection('carts').deleteOne({ userId: userId });
    console.log('Cart cleared:', result.deletedCount);
    
    return NextResponse.json({ success: true, deleted: result.deletedCount });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json({ success: true });
  } finally {
    if (client) {
      await client.close();
    }
  }
}