import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Product from '../../../lib/models/Product';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const body = await request.json();
    const id = params.id;
    
    // Map dashboard status to model status
    if (body.status === 'instock') {
      body.status = 'active';
    } else if (body.status === 'outofstock') {
      body.status = 'outofstock';
    }
    
    // Add audit fields
    const userId = request.headers.get('x-user-id');
    const userName = request.headers.get('x-user-name');
    body.updatedBy = userId || 'system';
    body.updatedByName = userName || 'System';
    
    // Validate and clean sizes
    if (body.sizes && Array.isArray(body.sizes)) {
      body.sizes = body.sizes.filter((size: any) => size.size && size.size.trim());
    }
    
    // Validate and clean colors
    if (body.colors && Array.isArray(body.colors)) {
      body.colors = body.colors.filter((color: any) => color.name && color.name.trim());
    }
    
    // Handle additional images array
    if (body.additionalImages && Array.isArray(body.additionalImages)) {
      body.additionalImages = body.additionalImages.filter((img: string) => img && img.trim());
    } else if (body.images && Array.isArray(body.images)) {
      body.additionalImages = body.images.filter((img: string) => img && img.trim());
      delete body.images;
    }
    
    console.log('Updating product with data:', JSON.stringify(body, null, 2));
    
    // Try to find by _id first, then by id field
    let product = await Product.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    
    if (!product) {
      // Try finding by id field if _id doesn't work
      product = await Product.findOneAndUpdate({ id: parseInt(id) }, body, { new: true, runValidators: true });
    }
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error('Product update error:', error);
    console.error('Error details:', error.message);
    return NextResponse.json({ error: `Failed to update product: ${error.message}` }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const id = params.id;
    
    // Try to delete by _id first, then by id field
    let result = await Product.findByIdAndDelete(id);
    
    if (!result) {
      // Try finding by id field if _id doesn't work
      result = await Product.findOneAndDelete({ id: parseInt(id) });
    }
    
    if (!result) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Product delete error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}