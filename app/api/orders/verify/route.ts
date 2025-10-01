import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { MongoClient } = require('mongodb');
  let client;
  
  try {
    const { orderId } = await request.json();
    
    const mongoUri = process.env.MONGODB_URI;
    client = new MongoClient(mongoUri);
    await client.connect();
    
    const db = client.db('fashionBreeze');
    const { ObjectId } = require('mongodb');
    
    // Get order
    const order = await db.collection('orders').findOne({ _id: new ObjectId(orderId) });
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' });
    }
    
    // Get current products
    const products = await db.collection('products').find({}).toArray();
    
    // Verify each item in the order
    const verifiedItems = order.items.map((item: any) => {
      const currentProduct = products.find((p: any) => p.id === item.id || p._id === item._id);
      return {
        ...item,
        verified: !!currentProduct,
        currentStock: currentProduct?.status === 'instock'
      };
    });
    
    // Update order with verification status
    await db.collection('orders').updateOne(
      { _id: new ObjectId(orderId) },
      { $set: { items: verifiedItems, lastVerified: new Date() } }
    );
    
    return NextResponse.json({ 
      success: true, 
      verifiedItems,
      unavailableCount: verifiedItems.filter((item: any) => !item.verified).length
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Verification failed' });
  } finally {
    if (client) await client.close();
  }
}