import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const { MongoClient } = require('mongodb');
  let client;
  
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    client = new MongoClient(mongoUri);
    await client.connect();
    
    const db = client.db('fashionBreeze');
    const customers = await db.collection('customers').find({}).toArray();
    
    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error loading customers:', error);
    return NextResponse.json([]);
  } finally {
    if (client) {
      await client.close();
    }
  }
}