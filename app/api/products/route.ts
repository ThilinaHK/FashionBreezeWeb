import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import Product from '../../lib/models/Product';

export async function GET() {
  try {
    console.log('Connecting to MongoDB...');
    await dbConnect();
    console.log('MongoDB connected, fetching products...');
    
    const products = await Product.find({})
      .lean().limit(100).sort({ createdAt: -1 });
    
    console.log(`Found ${products.length} products in database`);
    

    
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
    
    // Auto-generate ID and Code
    if (!body.id) {
      const lastProduct = await Product.findOne().sort({ id: -1 }).select('id');
      body.id = lastProduct ? lastProduct.id + 1 : 1;
    }
    
    // Auto-generate code if empty or not provided
    if (!body.code || body.code.trim() === '') {
      // Find the highest existing code number
      const lastCodeProduct = await Product.findOne(
        { code: { $regex: /^FB\d{4}$/ } },
        { code: 1 }
      ).sort({ code: -1 });
      
      let nextNumber = 1;
      if (lastCodeProduct && lastCodeProduct.code) {
        const lastNumber = parseInt(lastCodeProduct.code.substring(2));
        nextNumber = lastNumber + 1;
      }
      
      body.code = `FB${String(nextNumber).padStart(4, '0')}`;
    }
    
    // Check for duplicate code
    const existingProduct = await Product.findOne({ code: body.code });
    if (existingProduct) {
      return NextResponse.json({ error: 'Product code already exists' }, { status: 400 });
    }
    
    // Add audit fields
    body.createdBy = userId || 'system';
    body.createdByName = userName || 'System';
    body.updatedBy = userId || 'system';
    body.updatedByName = userName || 'System';
    
    // Handle product details fields
    const detailFields = ['color', 'brand', 'style', 'sleeveType', 'neckline', 'pattern', 'sleeveLength', 'fitType', 'fabric', 'composition'];
    detailFields.forEach(field => {
      if (body[field] !== undefined) {
        body[field] = body[field] || '';
      }
    });
    
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
    
    // Transform sizes from dashboard format to model format
    if (body.sizes) {
      if (typeof body.sizes === 'object' && !Array.isArray(body.sizes)) {
        // Dashboard format: {S: 0, M: 0, L: 0, XL: 0}
        body.sizes = Object.entries(body.sizes)
          .filter(([size, stock]) => typeof stock === 'number')
          .map(([size, stock]) => ({
            size,
            stock: Number(stock),
            price: body.price || 0
          }));
      } else if (Array.isArray(body.sizes)) {
        // Array format: validate and clean
        body.sizes = body.sizes.filter((size: any) => {
          const hasValidSize = size.size && typeof size.size === 'string' && size.size.trim();
          const hasValidPrice = typeof size.price === 'number';
          return hasValidSize && hasValidPrice;
        });
      }
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
    
    // Handle reviewCount field
    if (body.reviewCount !== undefined) {
      body.reviewCount = Number(body.reviewCount) || 0;
    } else {
      body.reviewCount = 0;
    }
    
    // Handle reviews field
    if (body.reviews !== undefined) {
      if (Array.isArray(body.reviews)) {
        body.reviews = body.reviews.map((review: any) => ({
          user: review.user || '',
          rating: Number(review.rating) || 0,
          comment: review.comment || '',
          date: review.date ? new Date(review.date) : new Date(),
          verified: Boolean(review.verified)
        }));
      } else {
        body.reviews = [];
      }
    }
    
    // Handle rating field
    if (body.rating !== undefined) {
      if (typeof body.rating === 'object') {
        body.rating = {
          average: Number(body.rating.average) || 0,
          count: Number(body.rating.count) || 0
        };
      } else {
        body.rating = { average: 0, count: 0 };
      }
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