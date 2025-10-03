import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Customer from '../../../lib/models/Customer';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const userData = await request.json();
    
    // Auto-generate ID
    const lastCustomer = await Customer.findOne().sort({ id: -1 }).select('id');
    const customerId = lastCustomer ? lastCustomer.id + 1 : 1;
    
    const customer = await Customer.create({
      ...userData,
      id: customerId,
      status: 'active'
    });
    
    return NextResponse.json({ 
      success: true, 
      user: customer, 
      userId: customer._id.toString() 
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Registration failed' }, { status: 500 });
  }
}