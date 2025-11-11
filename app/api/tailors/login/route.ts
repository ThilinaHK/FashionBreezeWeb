import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { email, password } = await request.json();
    
    const tailor = await mongoose.connection.db.collection('tailors').findOne({ email, password });
    
    if (!tailor) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    if (tailor.status !== 'approved') {
      return NextResponse.json({ error: 'Account pending approval' }, { status: 403 });
    }
    
    return NextResponse.json({ 
      tailor: { 
        _id: tailor._id, 
        name: tailor.name, 
        email: tailor.email,
        shopName: tailor.shopName 
      } 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}