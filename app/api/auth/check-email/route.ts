import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { MongoClient } = require('mongodb');
  let client;
  
  try {
    const { email } = await request.json();
    
    const mongoUri = process.env.MONGODB_URI;
    client = new MongoClient(mongoUri);
    await client.connect();
    
    const db = client.db('fashionBreeze');
    const existingCustomer = await db.collection('customers').findOne({ email });
    
    return NextResponse.json({ exists: !!existingCustomer });
  } catch (error) {
    return NextResponse.json({ exists: false });
  } finally {
    if (client) await client.close();
  }
}