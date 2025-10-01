import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Try MongoDB first
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('fashionBreeze');
    const categories = await db.collection('categories').find({}).toArray();
    await client.close();
    
    if (categories.length > 0) {
      return NextResponse.json(categories);
    }
  } catch (error) {
    console.log('MongoDB failed, using fallback');
  }
  
  // Fallback to JSON file
  try {
    const filePath = path.join(process.cwd(), 'public', 'categories.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const categories = JSON.parse(fileContents);
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}