import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Customer from '../../../lib/models/Customer';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
    }
    
    let customer = await Customer.findById(userId);
    
    if (!customer) {
      customer = await Customer.findOne({ id: parseInt(userId) });
    }
    
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      user: customer 
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json({ success: false, error: 'Failed to get user' }, { status: 500 });
  }
}