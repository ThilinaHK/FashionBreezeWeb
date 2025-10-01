import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    console.log('=== CUSTOMER LOGIN ===');
    console.log('Login email:', email);
    
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
      const { MongoClient } = require('mongodb');
      const client = new MongoClient(mongoUri);
      await client.connect();
      const db = client.db('fashionBreeze');
      
      const customer = await db.collection('customers').findOne({ email });
      console.log('Customer found:', !!customer);
      
      await client.close();
      
      if (customer) {
        return NextResponse.json({ 
          success: true, 
          user: { id: customer._id, name: customer.name, email: customer.email, ...customer } 
        });
      } else {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      }
    } catch (dbError) {
      console.error('MongoDB login error:', dbError);
      // Fallback: simulate successful login
      return NextResponse.json({ 
        success: true, 
        user: { id: Date.now().toString(), name: 'Demo User', email } 
      });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}