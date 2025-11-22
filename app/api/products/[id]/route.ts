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
    
    // Handle product details fields
    const detailFields = ['color', 'brand', 'style', 'sleeveType', 'neckline', 'pattern', 'sleeveLength', 'fitType', 'fabric', 'composition'];
    detailFields.forEach(field => {
      if (body[field] !== undefined) {
        body[field] = body[field] || '';
      }
    });
    
    // Transform sizes from dashboard format to model format
    console.log('Original sizes data:', JSON.stringify(body.sizes));
    if (body.sizes) {
      if (typeof body.sizes === 'object' && !Array.isArray(body.sizes)) {
        // Dashboard format: {S: 0, M: 0, L: 0, XL: 0}
        console.log('Converting object sizes to array format');
        body.sizes = Object.entries(body.sizes)
          .filter(([size, stock]) => typeof stock === 'number')
          .map(([size, stock]) => ({
            size,
            stock: Number(stock),
            price: body.price || 0
          }));
        console.log('Converted sizes:', JSON.stringify(body.sizes));
      } else if (Array.isArray(body.sizes)) {
        // Array format: validate and clean
        console.log('Validating array sizes format');
        body.sizes = body.sizes.filter((size: any) => {
          const hasValidSize = size.size && typeof size.size === 'string' && size.size.trim();
          const hasValidPrice = typeof size.price === 'number' && size.price >= 0;
          return hasValidSize && hasValidPrice;
        });
        console.log('Validated sizes:', JSON.stringify(body.sizes));
      }
    } else {
      console.log('No sizes data provided');
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
    
    // Handle specifications - ensure it's properly structured
    if (body.specifications && typeof body.specifications === 'object') {
      // Clean up empty specification fields
      const specs = body.specifications;
      body.specifications = {
        material: specs.material || '',
        careInstructions: specs.careInstructions || '',
        origin: specs.origin || '',
        weight: specs.weight || ''
      };
    }
    
    // Handle reviewCount field
    if (body.reviewCount !== undefined) {
      body.reviewCount = Number(body.reviewCount) || 0;
    }
    
    console.log('Final body before update:', JSON.stringify(body, null, 2));
    console.log('Product details check:', {
      color: body.color,
      brand: body.brand,
      style: body.style,
      sizes: body.sizes
    });
    
    // Check for duplicate code when updating
    if (body.code) {
      const existingProduct = await Product.findOne({ 
        code: body.code, 
        $nor: [{ id: parseInt(id) }, { _id: id }] 
      });
      if (existingProduct) {
        return NextResponse.json({ error: 'Product code already exists' }, { status: 400 });
      }
    }
    
    // Check if id is numeric (custom id field) or ObjectId
    let product;
    if (/^\d+$/.test(id)) {
      // Numeric ID - use custom id field
      product = await Product.findOneAndUpdate({ id: parseInt(id) }, body, { new: true, runValidators: false });
    } else {
      // ObjectId - use _id field
      product = await Product.findByIdAndUpdate(id, body, { new: true, runValidators: false });
    }
    
    console.log('Updated product result:', JSON.stringify(product, null, 2));
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    // Trigger cart refresh for all users by updating timestamp
    // This will cause the frontend to recalculate delivery costs
    const timestamp = Date.now();
    
    return NextResponse.json({ 
      success: true, 
      product,
      timestamp,
      message: 'Product updated successfully. Cart delivery costs will be recalculated.' 
    });
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
    
    // Check if id is numeric (custom id field) or ObjectId
    let result;
    if (/^\d+$/.test(id)) {
      // Numeric ID - use custom id field
      result = await Product.findOneAndDelete({ id: parseInt(id) });
    } else {
      // ObjectId - use _id field
      result = await Product.findByIdAndDelete(id);
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