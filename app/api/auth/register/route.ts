import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const userData = await request.json();
    
    const userId = Date.now().toString();
    const user = { ...userData, _id: userId, createdAt: new Date() };
    
    return NextResponse.json({ success: true, user, userId });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Registration failed' }, { status: 500 });
  }
}