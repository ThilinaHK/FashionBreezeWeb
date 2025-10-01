import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const id = parseInt(params.id);
    
    // Always update JSON file for immediate store updates
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'src', 'assets', 'products.txt');
    
    try {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const products = JSON.parse(fileContents);
      const productIndex = products.findIndex((p: any) => p.id === id);
      
      if (productIndex !== -1) {
        products[productIndex] = { ...products[productIndex], ...body };
        fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
        console.log('Product updated in JSON file');
      }
    } catch (fileError) {
      console.error('File update failed:', fileError);
    }
    
    // Try MongoDB update
    try {
      const { MongoClient } = require('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      const db = client.db('fashionBreeze');
      
      await db.collection('products').updateOne(
        { id },
        { $set: { ...body, updatedAt: new Date() } }
      );
      await client.close();
      console.log('Product updated in MongoDB');
    } catch (dbError) {
      console.log('MongoDB update failed:', dbError);
    }
    
    return NextResponse.json({ success: true, id, ...body });
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