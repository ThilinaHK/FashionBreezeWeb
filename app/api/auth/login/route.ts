import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Customer from '../../../lib/models/Customer';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { email, password, phone } = await request.json();
    
    if (!email && !phone) {
      return NextResponse.json({ success: false, error: 'Email or phone required' }, { status: 400 });
    }
    
    if (email && !password) {
      return NextResponse.json({ success: false, error: 'Password required' }, { status: 400 });
    }
    
    // Find customer by email or phone
    const query = email ? { email } : { phone };
    const customer = await Customer.findOne(query);
    
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
    }
    
    // Validate password if logging in with email
    if (email && customer.password !== password) {
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
    }
    
    if (customer.status !== 'active') {
      return NextResponse.json({ success: false, error: 'Account is inactive' }, { status: 403 });
    }
    
    return NextResponse.json({ 
      success: true, 
      user: { ...customer.toObject(), password: undefined }, // Don't send password back
      userId: customer._id.toString() 
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Login failed' }, { status: 500 });
  }
}