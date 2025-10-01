import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { MongoClient } = require('mongodb');
  let client;
  
  try {
    const cookies = request.headers.get('cookie');
    const userId = cookies?.split(';').find(c => c.trim().startsWith('userId='))?.split('=')[1];
    
    if (!userId) {
      return NextResponse.json({ authenticated: false });
    }

    const mongoUri = process.env.MONGODB_URI;
    client = new MongoClient(mongoUri);
    await client.connect();
    
    const db = client.db('fashionBreeze');
    const { ObjectId } = require('mongodb');
    
    const user = await db.collection('customers').findOne({ _id: new ObjectId(userId) });
    
    if (user) {
      return NextResponse.json({ 
        authenticated: true, 
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          country: user.country,
          address: user.address
        }
      });
    }
    
    return NextResponse.json({ authenticated: false });
  } catch (error) {
    return NextResponse.json({ authenticated: false });
  } finally {
    if (client) await client.close();
  }
}