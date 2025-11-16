import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import Product from '../../lib/models/Product';

export async function GET() {
  try {
    console.log('Connecting to MongoDB...');
    await dbConnect();
    console.log('MongoDB connected, fetching products...');
    
    const products = await Product.find(
      { status: { $in: ['active', 'instock'] } }
    ).lean().limit(100).sort({ createdAt: -1 });
    
    console.log(`Found ${products.length} products in database`);
    
    if (products.length === 0) {
      console.log('No products found, checking all products...');
      const allProducts = await Product.find({}).lean().limit(10);
      console.log(`Total products in database: ${allProducts.length}`);
      
      if (allProducts.length > 0) {
        console.log('Returning all products regardless of status');
        return NextResponse.json(allProducts, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
      }
    }
    
    return NextResponse.json(products, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Products API error:', error);
    console.error('Error details:', error.message);
    return NextResponse.json([], {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const userId = request.headers.get('x-user-id');
    const userName = request.headers.get('x-user-name');
    
    // Auto-generate ID
    if (!body.id) {
      const lastProduct = await Product.findOne().sort({ id: -1 }).select('id');
      body.id = lastProduct ? lastProduct.id + 1 : 1;
    }
    
    // Add audit fields
    body.createdBy = userId || 'system';
    body.createdByName = userName || 'System';
    body.updatedBy = userId || 'system';
    body.updatedByName = userName || 'System';
    
    // Auto-generate missing required fields
    if (!body.slug) {
      body.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + body.id;
    }
    if (!body.description) {
      body.description = `High-quality ${body.name} - ${body.category}`;
    }
    if (!body.subcategory) {
      body.subcategory = 'General';
    }
    
    // Handle specifications
    if (!body.specifications) {
      body.specifications = {
        material: 'Premium Cotton',
        careInstructions: 'Machine Wash',
        weight: 'Regular Fit',
        origin: 'Sri Lanka'
      };
    } else if (typeof body.specifications === 'object') {
      // Ensure specifications are properly structured
      const specs = body.specifications;
      body.specifications = {
        material: specs.material || '',
        careInstructions: specs.careInstructions || '',
        origin: specs.origin || '',
        weight: specs.weight || ''
      };
    }
    
    // Handle category - for now, store as string since dashboard sends string
    // In a full implementation, you'd look up the category ObjectId
    
    // Map dashboard status to model status
    if (body.status === 'instock') {
      body.status = 'active';
    } else if (body.status === 'outofstock') {
      body.status = 'outofstock';
    }
    
    // Validate sizes if provided
    if (body.sizes && Array.isArray(body.sizes)) {
      body.sizes = body.sizes.filter((size: any) => size.size && size.size.trim());
    }
    
    // Validate colors if provided
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
    
    console.log('Creating product with data:', JSON.stringify(body, null, 2));
    const product = await Product.create(body);
    
    return NextResponse.json(product, { 
      status: 201,
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error: any) {
    console.error('Product creation error:', error);
    console.error('Error details:', error.message);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Product code or slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: `Failed to create product: ${error.message}` }, { status: 500 });
  }
}