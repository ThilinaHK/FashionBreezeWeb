import { NextRequest, NextResponse } from 'next/server';

// In-memory customer storage for demo
let customers: any[] = [
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
];

export async function POST(request: NextRequest) {
  const { MongoClient } = require('mongodb');
  let client;
  
  try {
    const body = await request.json();
    console.log('Registering customer:', body);
    
    const mongoUri = process.env.MONGODB_URI;
    client = new MongoClient(mongoUri);
    await client.connect();
    
    const db = client.db('fashionBreeze');
    
    // Check if customer already exists
    const existingCustomer = await db.collection('customers').findOne({ email: body.email });
    if (existingCustomer) {
      return NextResponse.json({ error: 'Email already registered and cannot be changed' }, { status: 400 });
    }
    
    // Create new customer
    const newCustomer = {
      ...body,
      createdAt: new Date()
    };
    
    const result = await db.collection('customers').insertOne(newCustomer);
    console.log('Customer saved to MongoDB:', result.insertedId);
    
    return NextResponse.json({ 
      success: true, 
      user: { _id: result.insertedId, ...newCustomer }
    });
  } catch (error) {
    console.error('Registration error:', error);
    // Fallback: add to in-memory array
    const newCustomer = {
      _id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString()
    };
    customers.push(newCustomer);
    
    return NextResponse.json({ 
      success: true, 
      user: newCustomer
    });
  } finally {
    if (client) await client.close();
  }
}

export async function GET() {
  return NextResponse.json(customers);
}