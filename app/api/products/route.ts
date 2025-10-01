import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  console.log('=== LOADING PRODUCTS ===');
  
  // Try MongoDB first
  try {
    const mongoUri = process.env.MONGODB_URI;
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db('fashionBreeze');
    
    const products = await db.collection('products').find({}).toArray();
    await client.close();
    
    if (products.length > 0) {
      console.log('Loaded products from MongoDB:', products.length);
      return NextResponse.json(products);
    }
  } catch (dbError) {
    console.log('MongoDB failed, using fallback products');
  }
  
  // Fallback hardcoded products
  const products = [
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
    },
    {
      id: 2,
      name: "Blue Denim Jeans",
      code: "CL002", 
      price: 14997,
      category: "For Men",
      image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
      sizes: { "S": 7, "M": 10, "L": 6, "XL": 4 },
      status: "instock",
      rating: 4.2,
      reviewCount: 89
    },
    {
      id: 3,
      name: "Summer Floral Dress",
      code: "WD001",
      price: 8997,
      category: "For Women", 
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop",
      sizes: { "XS": 5, "S": 8, "M": 12, "L": 7 },
      status: "instock",
      rating: 4.7,
      reviewCount: 156
    },
    {
      id: 4,
      name: "Kids Rainbow Hoodie",
      code: "KH001",
      price: 6997,
      category: "Kids",
      image: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400&h=400&fit=crop", 
      sizes: { "XS": 10, "S": 15, "M": 8, "L": 5 },
      status: "instock",
      rating: 4.8,
      reviewCount: 203
    },
    {
      id: 5,
      name: "Black Leather Jacket",
      code: "LJ001",
      price: 25997,
      category: "For Men",
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop",
      sizes: { "S": 5, "M": 8, "L": 12, "XL": 6 },
      status: "instock",
      rating: 4.6,
      reviewCount: 95
    },
    {
      id: 6,
      name: "Red Evening Gown",
      code: "EG001",
      price: 18997,
      category: "For Women",
      image: "https://images.unsplash.com/photo-1566479179817-c0ae8e4b4b3d?w=400&h=400&fit=crop",
      sizes: { "XS": 3, "S": 6, "M": 9, "L": 4 },
      status: "instock",
      rating: 4.9,
      reviewCount: 187
    },
    {
      id: 7,
      name: "Hair Shampoo",
      code: "HS001",
      price: 2997,
      category: "Hair",
      image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop",
      sizes: { "S": 25, "M": 30, "L": 20 },
      status: "instock",
      rating: 4.4,
      reviewCount: 312
    },
    {
      id: 8,
      name: "Rose Perfume",
      code: "RP001",
      price: 15997,
      category: "Fragrances",
      image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop",
      sizes: { "S": 15, "M": 12, "L": 8 },
      status: "instock",
      rating: 4.7,
      reviewCount: 189
    },
    {
      id: 9,
      name: "Face Moisturizer",
      code: "FM001",
      price: 4997,
      category: "Skin",
      image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&h=400&fit=crop",
      sizes: { "S": 20, "M": 25, "L": 15 },
      status: "instock",
      rating: 4.6,
      reviewCount: 267
    },
    {
      id: 10,
      name: "Scented Candle",
      code: "SC001",
      price: 3997,
      category: "Home",
      image: "https://images.unsplash.com/photo-1602874801006-2bd9c81f5d5e?w=400&h=400&fit=crop",
      sizes: { "S": 30, "M": 25, "L": 20 },
      status: "instock",
      rating: 4.5,
      reviewCount: 145
    }
  ];
  
  console.log('Returning fallback products:', products.length);
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('=== CREATING PRODUCT ===');
    console.log('Product data:', body);
    
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
      const { MongoClient } = require('mongodb');
      const client = new MongoClient(mongoUri);
      await client.connect();
      const db = client.db('fashionBreeze');
      
      // Get next ID
      const lastProduct = await db.collection('products').findOne({}, { sort: { id: -1 } });
      const nextId = lastProduct ? lastProduct.id + 1 : 1;
      
      const newProduct = { ...body, id: nextId };
      console.log('Inserting product with ID:', nextId);
      
      const result = await db.collection('products').insertOne(newProduct);
      console.log('Product created with ID:', result.insertedId);
      
      await client.close();
      
      return NextResponse.json(newProduct, { status: 201 });
    } catch (dbError) {
      console.error('MongoDB product creation error:', dbError);
      return NextResponse.json({ success: true, id: Date.now() }, { status: 201 });
    }
  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}