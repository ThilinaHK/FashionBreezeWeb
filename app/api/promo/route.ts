import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { promoCode, cartTotal } = await request.json();
    
    if (!promoCode) {
      return NextResponse.json({ error: 'Promo code is required' }, { status: 400 });
    }

    // Get products with this promo code
    const Product = require('../../lib/models/Product').default;
    const products = await Product.find({ 
      promoCode: promoCode.toUpperCase(),
      status: { $in: ['active', 'instock'] }
    });

    if (products.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired promo code' }, { status: 404 });
    }

    // Calculate total discount available
    let totalDiscount = 0;
    const applicableProducts = products.map(product => {
      const savings = (product.originalPrice || product.price) - product.price;
      totalDiscount += savings;
      return {
        id: product._id,
        name: product.name,
        originalPrice: product.originalPrice || product.price,
        discountedPrice: product.price,
        savings: savings,
        discountPercent: product.discount || 0
      };
    });

    return NextResponse.json({
      success: true,
      promoCode: promoCode.toUpperCase(),
      discount: totalDiscount,
      discountPercent: products[0]?.discount || 0,
      applicableProducts,
      message: `Promo code applied! Save ₹${totalDiscount.toFixed(2)}`
    });
  } catch (error) {
    console.error('Error validating promo code:', error);
    return NextResponse.json({ error: 'Failed to validate promo code' }, { status: 500 });
  }
}