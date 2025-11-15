import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import User from '../../lib/models/User';
import Order from '../../lib/models/Order';

export async function GET() {
  try {
    await dbConnect();
    const customers = await User.find({}).sort({ createdAt: -1 });
    
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
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const { id, name, email, phone, country, address } = await request.json();
    
    const customer = await User.findByIdAndUpdate(id, {
      name, email, phone, country, address
    }, { new: true });
    
    return NextResponse.json({ success: true, customer });
  } catch (error) {
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
      User.findByIdAndDelete(id),
      Order.deleteMany({ userId: id })
    ]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}