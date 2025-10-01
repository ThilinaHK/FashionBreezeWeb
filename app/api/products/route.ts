import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import fs from 'fs';
import path from 'path';

export async function GET() {
  console.log('=== LOADING PRODUCTS ===');
  
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);
    
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(mongoUri);
    await client.connect();
    console.log('Connected to MongoDB for products');
    
    const db = client.db('fashionBreeze');
    
    // List collections to verify products exists
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    const products = await db.collection('products').find({}).toArray();
    console.log('Found products in MongoDB:', products.length);
    await client.close();
    
    if (products.length > 0) {
      console.log('Returning MongoDB products');
      return NextResponse.json(products);
    }
  } catch (error) {
    console.error('MongoDB error:', error);
  }
  
  // Fallback to JSON file
  console.log('Using JSON file fallback');
  try {
    const filePath = path.join(process.cwd(), 'public', 'products.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const products = JSON.parse(fileContents);
    console.log('Found products in JSON file:', products.length);
    return NextResponse.json(products);
  } catch (error) {
    console.error('JSON file error:', error);
    // Return default products if everything fails
    const defaultProducts = [
      {
        id: 1,
        name: "Classic White T-Shirt",
        code: "CL001",
        price: 5997,
        category: "For Men",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
        sizes: { "S": 12, "M": 8, "L": 15, "XL": 3 },
        status: "instock",
        rating: 4.5,
        reviewCount: 128
      }
    ];
    console.log('Returning default products');
    return NextResponse.json(defaultProducts);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    try {
      await dbConnect();
      const { MongoClient } = require('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      const db = client.db('fashionBreeze');
      
      const newProduct = { ...body, id: Date.now() };
      await db.collection('products').insertOne(newProduct);
      await client.close();
      
      return NextResponse.json(newProduct, { status: 201 });
    } catch (dbError) {
      return NextResponse.json({ success: true, id: Date.now() }, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}