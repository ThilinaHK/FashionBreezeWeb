import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import Customer from '../../lib/models/Customer';

export async function GET() {
  try {
    await dbConnect();
    const customers = await Customer.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error loading customers:', error);
    return NextResponse.json([
      {
        _id: '1',
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        country: 'USA',
        address: {
          line1: '123 Main Street',
          line2: 'Apt 4B',
          line3: 'New York, NY 10001'
        },
        status: 'active',
        createdAt: new Date().toISOString()
      }
    ]);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const { customerId, status } = await request.json();
    
    let customer = await Customer.findByIdAndUpdate(customerId, { status }, { new: true });
    
    if (!customer) {
      customer = await Customer.findOneAndUpdate({ id: parseInt(customerId) }, { status }, { new: true });
    }
    
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, customer });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Auto-generate ID
    if (!body.id) {
      const lastCustomer = await Customer.findOne().sort({ id: -1 }).select('id');
      body.id = lastCustomer ? lastCustomer.id + 1 : 1;
    }
    
    const customer = await Customer.create(body);
    return NextResponse.json({ success: true, customer }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const { customerId } = await request.json();
    
    let result = await Customer.findByIdAndDelete(customerId);
    
    if (!result) {
      result = await Customer.findOneAndDelete({ id: parseInt(customerId) });
    }
    
    if (!result) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}