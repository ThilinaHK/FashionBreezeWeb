import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await dbConnect();
    const designs = await mongoose.connection.db!.collection('designs').find({ isActive: true }).toArray();
    return NextResponse.json(designs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch designs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    
    const design = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };
    
    const result = await mongoose.connection.db!.collection('designs').insertOne(design);
    return NextResponse.json({ _id: result.insertedId, ...design });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create design' }, { status: 500 });
  }
}