import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Customer from '../../../lib/models/Customer';

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const { userId, ...updateData } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
    }
    
    let customer = await Customer.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });
    
    if (!customer) {
      customer = await Customer.findOneAndUpdate({ id: parseInt(userId) }, updateData, { new: true, runValidators: true });
    }
    
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      user: customer 
    });
  } catch (error: any) {
    console.error('Update error:', error);
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 });
  }
}