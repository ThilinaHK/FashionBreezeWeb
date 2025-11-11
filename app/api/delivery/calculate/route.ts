import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Category from '../../../lib/models/Category';

interface DeliveryCalculationRequest {
  subtotal: number;
  location?: string;
  weight?: number;
  items?: any[];
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { subtotal, location, weight, items }: DeliveryCalculationRequest = await request.json();
    
    let deliveryCost = 0;
    
    // Free delivery for orders above LKR 5000
    if (subtotal >= 5000) {
      deliveryCost = 0;
    } else {
      // Calculate category-based delivery cost
      let categoryDeliveryCost = 300; // Default base delivery cost
      
      if (items && items.length > 0) {
        try {
          // Get unique categories from cart items
          const categories = [...new Set(items.map(item => item.category).filter(Boolean))];
          console.log('Cart categories for delivery calculation:', categories);
          
          if (categories.length > 0) {
            // Get category delivery costs from database
            const categoryData = await Category.find({ name: { $in: categories } }, 'name deliveryCost').lean();
            console.log('Category delivery data from DB:', categoryData);
            
            if (categoryData.length > 0) {
              // Use the highest delivery cost among all categories in the cart
              const maxCategoryDeliveryCost = Math.max(...categoryData.map(cat => cat.deliveryCost || 0));
              console.log('Max category delivery cost:', maxCategoryDeliveryCost);
              if (maxCategoryDeliveryCost > 0) {
                categoryDeliveryCost = maxCategoryDeliveryCost;
              }
            }
          }
        } catch (error) {
          console.error('Error fetching category delivery costs:', error);
          // Fall back to default cost if category lookup fails
        }
      }
      
      deliveryCost = categoryDeliveryCost;
      
      // Location-based pricing
      if (location) {
        const locationLower = location.toLowerCase();
        
        // Major cities - standard delivery
        if (locationLower.includes('colombo') || 
            locationLower.includes('kandy') || 
            locationLower.includes('galle') || 
            locationLower.includes('negombo')) {
          deliveryCost = 300;
        }
        // Suburban areas
        else if (locationLower.includes('mount lavinia') || 
                 locationLower.includes('dehiwala') || 
                 locationLower.includes('moratuwa') || 
                 locationLower.includes('kotte')) {
          deliveryCost = 400;
        }
        // Remote areas
        else if (locationLower.includes('jaffna') || 
                 locationLower.includes('batticaloa') || 
                 locationLower.includes('trincomalee') || 
                 locationLower.includes('anuradhapura')) {
          deliveryCost = 600;
        }
        // Very remote areas
        else if (locationLower.includes('vavuniya') || 
                 locationLower.includes('mannar') || 
                 locationLower.includes('mullaitivu')) {
          deliveryCost = 800;
        }
      }
      
      // Weight-based additional charges
      if (weight && weight > 2) {
        const extraWeight = weight - 2;
        deliveryCost += Math.ceil(extraWeight) * 50; // LKR 50 per kg above 2kg
      }
      
      // Item count based charges (for bulk orders)
      if (items && items.length > 5) {
        deliveryCost += (items.length - 5) * 25; // LKR 25 per additional item above 5
      }
    }
    
    // Calculate total
    const total = subtotal + deliveryCost;
    
    // Determine delivery message
    let deliveryMessage = '';
    if (deliveryCost === 0) {
      deliveryMessage = 'FREE Delivery (Order above LKR 5,000)';
    } else {
      deliveryMessage = `Delivery: LKR ${deliveryCost}`;
      if (subtotal < 5000) {
        const remaining = 5000 - subtotal;
        deliveryMessage += ` (Add LKR ${remaining} more for FREE delivery)`;
      }
      // Add category-based delivery note if applicable
      if (items && items.length > 0) {
        const categories = [...new Set(items.map(item => item.category).filter(Boolean))];
        if (categories.length > 0) {
          deliveryMessage += ` - Category-based pricing`;
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      subtotal,
      deliveryCost,
      total,
      deliveryMessage,
      freeDeliveryThreshold: 5000,
      remainingForFreeDelivery: subtotal < 5000 ? 5000 - subtotal : 0
    });
    
  } catch (error: any) {
    console.error('Delivery calculation error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to calculate delivery cost',
      subtotal: 0,
      deliveryCost: 300,
      total: 300
    }, { status: 500 });
  }
}