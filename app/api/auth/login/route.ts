import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Customer from '../../../lib/models/Customer';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { email, phone } = await request.json();
    
    if (!email && !phone) {
      return NextResponse.json({ success: false, error: 'Email or phone required' }, { status: 400 });
    }
    
    // Find customer by email or phone
    const query = email ? { email } : { phone };
    const customer = await Customer.findOne(query);
    
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }
    
    if (customer.status !== 'active') {
      return NextResponse.json({ success: false, error: 'Account is inactive' }, { status: 403 });
    }
    
    return NextResponse.json({ 
      success: true, 
      user: customer, 
      userId: customer._id.toString() 
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Login failed' }, { status: 500 });
  }
}