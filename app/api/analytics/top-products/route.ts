import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Product from '../../../lib/models/Product';

export async function GET() {
  try {
    await dbConnect();
    
    const products = await Product.find({})
      .select('name category status sizes inventory')
      .limit(20)
      .sort({ createdAt: -1 });
    
    const productsWithStock = products.map(product => {
      let totalStock = 0;
      
      if (product.sizes && typeof product.sizes === 'object') {
        if (Array.isArray(product.sizes)) {
          totalStock = product.sizes.reduce((sum, size) => sum + (size.stock || 0), 0);
        } else {
          totalStock = Object.values(product.sizes).reduce((sum: number, stock: any) => 
            sum + (typeof stock === 'number' ? stock : stock?.stock || 0), 0);
        }
      }
      
      return {
        ...product.toObject(),
        totalStock
      };
    });
    
    return NextResponse.json(productsWithStock);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}