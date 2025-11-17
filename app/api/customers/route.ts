import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import Customer from '../../lib/models/Customer';
import Order from '../../lib/models/Order';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // If ID is provided, fetch specific customer
    if (id) {
      const customer = await Customer.findById(id);
      if (!customer) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      }
      
      // Get order count and total spent for this customer
      const orderCount = await Order.countDocuments({ userId: customer._id });
      const totalSpent = await Order.aggregate([
        { $match: { userId: customer._id } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]);
      
      const customerData = {
        ...customer.toObject(),
        orderCount,
        totalSpent: totalSpent[0]?.total || 0
      };
      
      return NextResponse.json([customerData]); // Return as array for compatibility
    }
    
    // Otherwise, fetch all customers
    const customers = await Customer.find({}).sort({ createdAt: -1 });
    
    // Get order counts for each customer
    const customersWithOrders = await Promise.all(
      customers.map(async (customer) => {
        const orderCount = await Order.countDocuments({ userId: customer._id });
        const totalSpent = await Order.aggregate([
          { $match: { userId: customer._id } },
          { $group: { _id: null, total: { $sum: '$total' } } }
        ]);
        
        return {
          ...customer.toObject(),
          orderCount,
          totalSpent: totalSpent[0]?.total || 0
        };
      })
    );
    
    return NextResponse.json(customersWithOrders);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const { id, name, email, phone, country, address } = await request.json();
    
    const customer = await Customer.findByIdAndUpdate(id, {
      name, email, phone, country, address
    }, { new: true });
    
    return NextResponse.json({ success: true, customer });
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // Delete customer and their orders
    await Promise.all([
      Customer.findByIdAndDelete(id),
      Order.deleteMany({ userId: id })
    ]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}