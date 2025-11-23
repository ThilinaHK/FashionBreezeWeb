import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Product from '../../../lib/models/Product';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { productId, sizes, sendEmail } = await request.json();
    
    if (!productId || !sizes) {
      return NextResponse.json({ error: 'Product ID and sizes are required' }, { status: 400 });
    }

    // Find and update product stock
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Update stock for specific sizes
    if (product.sizes && typeof product.sizes === 'object') {
      Object.keys(sizes).forEach(size => {
        if (sizes[size] > 0 && product.sizes[size] !== undefined) {
          product.sizes[size] += sizes[size];
        }
      });
    }

    // Calculate total restocked quantity
    const totalRestocked = Object.values(sizes).reduce((sum: number, qty: any) => sum + (qty || 0), 0);

    // Update total inventory if exists
    if (product.inventory) {
      product.inventory.totalStock += totalRestocked;
    }

    // Update status to in stock if any stock added
    if (totalRestocked > 0) {
      product.status = 'instock';
    }
    
    await product.save();

    // Send restock notification emails if enabled
    if (sendEmail) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email/restock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product._id,
            productName: product.name,
            productImage: product.image,
            productPrice: product.price,
            restockQuantity: totalRestocked,
            restockSizes: sizes
          })
        });
      } catch (emailError) {
        console.error('Failed to send restock emails:', emailError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Product restocked successfully',
      product: {
        id: product._id,
        name: product.name,
        newStock: typeof product.sizes === 'object' ? 
          Object.values(product.sizes).reduce((a, b) => a + b, 0) : totalRestocked,
        restockedSizes: sizes
      }
    });
  } catch (error) {
    console.error('Error restocking product:', error);
    return NextResponse.json({ error: 'Failed to restock product' }, { status: 500 });
  }
}