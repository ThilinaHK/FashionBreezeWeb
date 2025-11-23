import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import { MongoClient } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db('fashionBreeze');
    
    const { orderId, productId, reason, type, description, customerInfo } = await request.json();
    
    const returnRequest = {
      orderId,
      productId,
      reason,
      type, // 'return' or 'damage'
      description,
      customerInfo,
      status: 'pending',
      createdAt: new Date(),
      returnId: `RET${Date.now()}`
    };
    
    await db.collection('returns').insertOne(returnRequest);
    await client.close();
    
    return NextResponse.json({ success: true, returnId: returnRequest.returnId });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create return request' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db('fashionBreeze');
    
    const returns = await db.collection('returns').find({}).sort({ createdAt: -1 }).toArray();
    await client.close();
    
    return NextResponse.json(returns);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch returns' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db('fashionBreeze');
    
    const { returnId, status, adminNotes } = await request.json();
    
    await db.collection('returns').updateOne(
      { returnId },
      { 
        $set: { 
          status, 
          adminNotes,
          updatedAt: new Date() 
        } 
      }
    );
    await client.close();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update return status' }, { status: 500 });
  }
}