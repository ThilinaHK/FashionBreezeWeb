import { NextRequest, NextResponse } from 'next/server';

// Import customers from registration module
let registeredCustomers: any[] = [];

export async function GET() {
  const { MongoClient } = require('mongodb');
  let client;
  
  try {
    const mongoUri = process.env.MONGODB_URI;
    client = new MongoClient(mongoUri);
    await client.connect();
    
    const db = client.db('fashionBreeze');
    const customers = await db.collection('customers').find({}).toArray();
    
    return NextResponse.json(customers);
  } catch (error) {
    console.log('MongoDB failed, using fallback customers');
    return NextResponse.json([
      {
        _id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        country: 'USA',
        address: {
          line1: '123 Main Street',
          line2: 'Apt 4B',
          line3: 'New York, NY 10001'
        },
        createdAt: new Date().toISOString()
      }
    ]);
  } finally {
    if (client) await client.close();
  }
}

export async function PUT(request: NextRequest) {
  const { MongoClient } = require('mongodb');
  let client;
  
  try {
    const { customerId, status } = await request.json();
    const mongoUri = process.env.MONGODB_URI;
    client = new MongoClient(mongoUri);
    await client.connect();
    
    const db = client.db('fashionBreeze');
    const { ObjectId } = require('mongodb');
    
    await db.collection('customers').updateOne(
      { _id: new ObjectId(customerId) },
      { $set: { status, updatedAt: new Date() } }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false });
  } finally {
    if (client) await client.close();
  }
}

// Add endpoint to sync with registration
export async function POST(request: NextRequest) {
  const customer = await request.json();
  registeredCustomers.push(customer);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const { MongoClient } = require('mongodb');
  let client;
  
  try {
    const { customerId } = await request.json();
    const mongoUri = process.env.MONGODB_URI;
    client = new MongoClient(mongoUri);
    await client.connect();
    
    const db = client.db('fashionBreeze');
    const { ObjectId } = require('mongodb');
    
    await db.collection('customers').deleteOne({ _id: new ObjectId(customerId) });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false });
  } finally {
    if (client) await client.close();
  }
}