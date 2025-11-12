import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const design = await mongoose.connection.db!.collection('designs').findOne({ _id: new ObjectId(params.id) });
    
    if (!design) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 });
    }
    
    return NextResponse.json(design);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch design' }, { status: 500 });
  }
}