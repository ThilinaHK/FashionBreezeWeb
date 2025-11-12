import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // In a real app, get customer ID from session/auth
    const customerId = 'customer@email.com'; // Placeholder
    
    const orders = await mongoose.connection.db!
      .collection('tailoring_orders')
      .find({ 'customerInfo.email': customerId })
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}