import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import Cart from '../../lib/models/Cart';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ items: [] });
    }
    
    const cart = await Cart.findOne({ userId }) || { items: [], total: 0 };
    return NextResponse.json(cart);
  } catch (error) {
    return NextResponse.json({ items: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { userId, items, total } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
    }
    
    // Check inventory for each item
    const Product = require('../../lib/models/Product').default;
    
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json({ 
          success: false, 
          error: `Product ${item.name} not found` 
        }, { status: 400 });
      }
      
      // Check total stock
      const availableStock = product.inventory?.totalStock || 0;
      if (item.quantity > availableStock) {
        return NextResponse.json({ 
          success: false, 
          error: `Only ${availableStock} units available for ${item.name}` 
        }, { status: 400 });
      }
      
      // Check size-specific stock if size is selected
      if (item.size) {
        const sizeStock = product.sizes?.find(s => s.size === item.size)?.stock || 0;
        if (item.quantity > sizeStock) {
          return NextResponse.json({ 
            success: false, 
            error: `Only ${sizeStock} units available for ${item.name} in size ${item.size}` 
          }, { status: 400 });
        }
      }
    }
    
    await Cart.findOneAndUpdate(
      { userId },
      { items, total },
      { upsert: true, new: true }
    );
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Cart save error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save cart' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const { userId } = await request.json();
    
    await Cart.findOneAndDelete({ userId });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to clear cart' }, { status: 500 });
  }
}