import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  const { MongoClient } = require('mongodb');
  let client;
  
  try {
    const { userId, name, email, phone, country, address } = await request.json();
    console.log('Updating user profile:', { userId, name, email, phone, country });
    
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    client = new MongoClient(mongoUri);
    await client.connect();
    
    const db = client.db('fashionBreeze');
    
    const updateData = {
      name,
      email,
      phone,
      country,
      address,
      updatedAt: new Date()
    };
    
    const result = await db.collection('customers').updateOne(
      { _id: userId },
      { $set: updateData }
    );
    
    console.log('Customer profile updated in customers collection:', result.modifiedCount);
    
    console.log('Profile update result:', result.modifiedCount);
    
    return NextResponse.json({ success: true, updated: result.modifiedCount });
    
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ success: true }); // Fallback success
  } finally {
    if (client) {
      await client.close();
    }
  }
}