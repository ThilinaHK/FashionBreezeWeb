import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Product from '../../../lib/models/Product';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { productId, size, quantity } = await request.json();
    
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ 
        available: false, 
        error: 'Product not found' 
      }, { status: 404 });
    }
    
    let availableStock = product.inventory?.totalStock || 0;
    
    // Check size-specific stock if size is provided
    if (size && product.sizes) {
      const sizeStock = product.sizes.find(s => s.size === size)?.stock || 0;
      availableStock = Math.min(availableStock, sizeStock);
    }
    
    const available = quantity <= availableStock;
    
    return NextResponse.json({
      available,
      availableStock,
      requestedQuantity: quantity,
      productName: product.name,
      size: size || null
    });
    
  } catch (error: any) {
    console.error('Availability check error:', error);
    return NextResponse.json({ 
      available: false, 
      error: 'Failed to check availability' 
    }, { status: 500 });
  }
}