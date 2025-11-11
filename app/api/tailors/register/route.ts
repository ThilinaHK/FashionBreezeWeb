import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    
    const existingTailor = await mongoose.connection.db.collection('tailors').findOne({ email: data.email });
    if (existingTailor) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }
    
    const tailor = {
      ...data,
      status: 'pending',
      createdAt: new Date(),
      approvedAt: null,
      approvedBy: null
    };
    
    const result = await mongoose.connection.db.collection('tailors').insertOne(tailor);
    return NextResponse.json({ _id: result.insertedId, message: 'Registration submitted for approval' });
  } catch (error) {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}