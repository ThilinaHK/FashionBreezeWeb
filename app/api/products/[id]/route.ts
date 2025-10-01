import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const id = parseInt(params.id);
    
    try {
      const { MongoClient } = require('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      const db = client.db('fashionBreeze');
      
      const result = await db.collection('products').updateOne(
        { id },
        { $set: body }
      );
      await client.close();
      
      console.log('Update result:', result);
      return NextResponse.json({ success: true, updated: result.modifiedCount });
    } catch (dbError) {
      console.log('MongoDB update failed, using fallback');
      // Fallback: Update JSON file
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), 'public', 'products.json');
      
      try {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const products = JSON.parse(fileContents);
        const productIndex = products.findIndex((p: any) => p.id === id);
        
        if (productIndex !== -1) {
          products[productIndex] = { ...products[productIndex], ...body };
          fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
        }
      } catch (fileError) {
        console.error('File update failed:', fileError);
      }
      
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    
    try {
      const { MongoClient } = require('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      const db = client.db('fashionBreeze');
      
      await db.collection('products').deleteOne({ id });
      await client.close();
      
      return NextResponse.json({ success: true });
    } catch (dbError) {
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}