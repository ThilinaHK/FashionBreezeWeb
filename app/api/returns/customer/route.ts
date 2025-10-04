import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import { MongoClient } from 'mongodb';

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const customerEmail = searchParams.get('email');

    if (!customerEmail) {
      return NextResponse.json({ error: 'Customer email required' }, { status: 400 });
    }

    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db('fashionbreeze');
    
    const returns = await db.collection('returns').find({
      'customerInfo.email': customerEmail
    }).sort({ createdAt: -1 }).toArray();

    await client.close();

    return NextResponse.json(returns);
  } catch (error) {
    console.error('Error fetching customer returns:', error);
    return NextResponse.json({ error: 'Failed to fetch returns' }, { status: 500 });
  }
}