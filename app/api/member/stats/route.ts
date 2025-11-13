import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await dbConnect();
    
    // In a real app, get customer ID from session/auth
    const customerId = 'customer@email.com'; // Placeholder
    
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    
    const orders = await db
      .collection('tailoring_orders')
      .find({ 'customerInfo.email': customerId })
      .toArray();
    
    const stats = {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => ['pending', 'approved', 'in_progress'].includes(o.status)).length,
      completedOrders: orders.filter(o => o.status === 'delivered').length
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}