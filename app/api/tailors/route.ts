import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    await dbConnect();
    const tailors = await mongoose.connection.db.collection('tailors').find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(tailors);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tailors' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const { tailorId, status, approvedBy } = await request.json();
    
    const updateData: any = { 
      status, 
      updatedAt: new Date() 
    };
    
    if (status === 'approved') {
      updateData.approvedAt = new Date();
      updateData.approvedBy = approvedBy;
    }
    
    await mongoose.connection.db.collection('tailors').updateOne(
      { _id: new ObjectId(tailorId) },
      { $set: updateData }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update tailor' }, { status: 500 });
  }
}