import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Customer from '../../../lib/models/Customer';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { email } = await request.json();
    
    const existingCustomer = await Customer.findOne({ email });
    const exists = !!existingCustomer;
    
    return NextResponse.json({ exists, available: !exists });
  } catch (error) {
    return NextResponse.json({ error: 'Check failed' }, { status: 500 });
  }
}