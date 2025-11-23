import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import Order from '../../lib/models/Order';
import OrderHistory from '../../lib/models/OrderHistory';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    let orders;
    if (userId) {
      orders = await Order.find({ userId }).sort({ createdAt: -1 }).lean();
    } else {
      orders = await Order.find({}).sort({ createdAt: -1 }).lean();
    }
    
    // Debug: Check if paymentSlip data exists
    const ordersWithSlips = orders.filter(order => order.paymentSlip);
    console.log(`Found ${ordersWithSlips.length} orders with payment slips out of ${orders.length} total orders`);
    
    // Debug specific order
    const debugOrder = orders.find(o => o.orderNumber === 'FB000004');
    if (debugOrder) {
      console.log('=== DEBUG ORDER FB000004 ===');
      console.log('Has paymentSlip:', !!debugOrder.paymentSlip);
      console.log('PaymentSlip data:', debugOrder.paymentSlip);
      console.log('=== END DEBUG ===');
    }
    
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error loading orders:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { userId, items: fallbackItems, total: fallbackTotal, customerInfo, paymentMethod, paymentStatus } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
    }
    
    // Get cart items from MongoDB, use fallback if not found
    const Cart = require('../../lib/models/Cart').default;
    const cart = await Cart.findOne({ userId });
    
    console.log('Order API - userId:', userId);
    console.log('Order API - cart found:', cart);
    console.log('Order API - cart items:', cart?.items?.length || 0);
    console.log('Order API - fallback items:', fallbackItems?.length || 0);
    
    let orderItems, orderTotal;
    if (cart && cart.items && cart.items.length > 0) {
      orderItems = cart.items;
      orderTotal = cart.total;
    } else if (fallbackItems && fallbackItems.length > 0) {
      orderItems = fallbackItems;
      orderTotal = fallbackTotal;
    } else {
      return NextResponse.json({ success: false, error: 'Cart is empty' }, { status: 400 });
    }
    
    // Auto-generate order number and ID
    const lastOrder = await Order.findOne().sort({ id: -1 }).select('id');
    const orderId = lastOrder ? lastOrder.id + 1 : 1;
    const orderNumber = `FB${orderId.toString().padStart(6, '0')}`;
    
    // Reduce inventory for each item
    const Product = require('../../lib/models/Product').default;
    
    for (const item of orderItems) {
      try {
        const product = await Product.findById(item.productId || item._id || item.id);
        if (product) {
          // Reduce size-specific stock if size is selected
          if (item.size && product.sizes && typeof product.sizes === 'object') {
            if (product.sizes[item.size] !== undefined && product.sizes[item.size] >= item.quantity) {
              product.sizes[item.size] -= item.quantity;
            }
          }
          
          // Calculate total stock from sizes
          const totalStock = typeof product.sizes === 'object' ? 
            Object.values(product.sizes).reduce((sum: number, stock: any) => sum + (stock || 0), 0) : 0;
          
          // Update inventory if exists
          if (product.inventory) {
            product.inventory.totalStock = totalStock;
          }
          
          // Update product status if out of stock
          if (totalStock <= 0) {
            product.status = 'outofstock';
          }
          
          await product.save();
        }
      } catch (productError) {
        console.error('Error updating product inventory:', productError);
        // Continue with order creation even if inventory update fails
      }
    }
    
    // Calculate delivery cost
    let deliveryCost = 0;
    let finalTotal = orderTotal;
    
    try {
      const deliveryResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/delivery/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subtotal: orderTotal,
          location: customerInfo?.address || '',
          items: orderItems
        })
      });
      
      if (deliveryResponse.ok) {
        const deliveryData = await deliveryResponse.json();
        deliveryCost = deliveryData.deliveryCost || 0;
        finalTotal = deliveryData.total || orderTotal;
      }
    } catch (deliveryError) {
      console.error('Delivery calculation failed, using default:', deliveryError);
      deliveryCost = 300; // Default delivery cost
      finalTotal = orderTotal + deliveryCost;
    }
    
    const order = await Order.create({
      id: orderId,
      orderNumber,
      userId,
      customerInfo,
      items: orderItems,
      subtotal: orderTotal,
      deliveryCost,
      total: finalTotal,
      status: 'pending',
      paymentMethod: paymentMethod || 'cash_on_delivery',
      paymentStatus: paymentStatus || 'pending'
    });
    
    // Create initial order history entry
    try {
      await OrderHistory.create({
        orderId: order._id,
        previousStatus: 'none',
        newStatus: 'pending',
        changedBy: {
          userId: 'system',
          username: 'System'
        },
        timestamp: new Date()
      });
    } catch (historyError) {
      console.error('Failed to create initial order history:', historyError);
    }
    
    // Send real-time notification to admin dashboard
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/notifications/socket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'newOrder',
          data: {
            orderId: order._id,
            orderNumber,
            customerName: customerInfo?.name || 'Customer',
            total: orderTotal,
            itemCount: orderItems.length
          }
        })
      });
    } catch (notificationError) {
      console.error('Failed to send new order notification:', notificationError);
    }
    
    // Clear cart after successful order
    try {
      await Cart.findOneAndDelete({ userId });
    } catch (cartError) {
      console.error('Failed to clear cart:', cartError);
      // Don't fail order creation if cart clearing fails
    }
    
    return NextResponse.json({ success: true, orderId: order._id, order });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const { orderId, status, isActive, paymentStatus, paymentMethod, paymentSlip } = await request.json();
    const userId = request.headers.get('x-user-id');
    const username = request.headers.get('x-user-name');
    
    // Find existing order first
    let existingOrder = await Order.findById(orderId);
    if (!existingOrder) {
      const numericId = parseInt(orderId);
      if (!isNaN(numericId)) {
        existingOrder = await Order.findOne({ id: numericId });
      }
    }
    if (!existingOrder) {
      existingOrder = await Order.findOne({ orderNumber: orderId });
    }
    
    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (paymentSlip !== undefined) {
      updateData['paymentSlip.status'] = paymentSlip.status;
    }
    
    // Handle inventory restoration for cancelled orders
    if (status === 'cancelled' && existingOrder.status !== 'cancelled') {
      const Product = require('../../lib/models/Product').default;
      
      for (const item of existingOrder.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          // Restore total stock
          product.inventory.totalStock += item.quantity;
          
          // Restore size-specific stock if size was selected
          if (item.size && product.sizes) {
            const sizeIndex = product.sizes.findIndex((s: any) => s.size === item.size);
            if (sizeIndex !== -1) {
              product.sizes[sizeIndex].stock += item.quantity;
            }
          }
          
          // Update product status if back in stock
          if (product.status === 'outofstock' && product.inventory.totalStock > 0) {
            product.status = 'active';
          }
          
          await product.save();
        }
      }
    }
    
    // Track status change in history
    if (status !== undefined && status !== existingOrder.status) {
      try {
        const historyRecord = await OrderHistory.create({
          orderId: existingOrder._id,
          previousStatus: existingOrder.status,
          newStatus: status,
          changedBy: {
            userId: userId || 'system',
            username: username || 'System'
          },
          timestamp: new Date()
        });
      } catch (historyError) {
        console.error('Failed to create order history:', historyError);
      }
    }
    
    // Track payment slip status change in history
    if (paymentSlip !== undefined && paymentSlip.status !== existingOrder.paymentSlip?.status) {
      try {
        await OrderHistory.create({
          orderId: existingOrder._id,
          previousStatus: existingOrder.paymentSlip?.status || 'none',
          newStatus: `payment_${paymentSlip.status}`,
          changedBy: {
            userId: userId || 'system',
            username: username || 'System'
          },
          timestamp: new Date()
        });
      } catch (historyError) {
        console.error('Failed to create payment history:', historyError);
      }
    }
    
    const order = await Order.findByIdAndUpdate(existingOrder._id, updateData, { new: true });
    
    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error('Order update error:', error);
    return NextResponse.json({ error: 'Failed to update order: ' + error.message }, { status: 500 });
  }
}

