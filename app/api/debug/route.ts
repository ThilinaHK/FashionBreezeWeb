import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import User from '../../lib/models/User';

export async function GET() {
  try {
    await dbConnect();
    
    const users = await User.find({});
    const adminUser = await User.findOne({ email: 'admin@fashionbreeze.com' });
    
    return NextResponse.json({
      totalUsers: users.length,
      adminExists: !!adminUser,
      adminData: adminUser ? {
        email: adminUser.email,
        username: adminUser.username,
        role: adminUser.role,
        status: adminUser.status
      } : null,
      allUsers: users.map(u => ({ email: u.email, role: u.role }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}