import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    await dbConnect();
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    const orders = await db.collection('tailoring_orders').find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    const data = await request.json();
    
    const order = {
      ...data,
      status: 'pending',
      createdAt: new Date(),
      orderNumber: `TO${Date.now()}`
    };
    
    const result = await db.collection('tailoring_orders').insertOne(order);
    return NextResponse.json({ _id: result.insertedId, ...order });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    const { orderId, status, comments } = await request.json();
    
    const updateData: any = { 
      status, 
      updatedAt: new Date() 
    };
    
    if (comments) {
      updateData.comments = comments;
    }
    
    await db.collection('tailoring_orders').updateOne(
      { _id: new ObjectId(orderId) },
      { $set: updateData }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}