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
    
    // Check if email is being changed and if new email already exists
    if (email) {
      const existingUser = await db.collection('customers').findOne({ 
        email: email, 
        _id: { $ne: userId } 
      });
      
      if (existingUser) {
        return NextResponse.json({ 
          success: false, 
          error: 'Email address is already registered by another user.' 
        });
      }
    }
    
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
    
    return NextResponse.json({ success: true, updated: result.modifiedCount });
    
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update profile' });
  } finally {
    if (client) {
      await client.close();
    }
  }
}