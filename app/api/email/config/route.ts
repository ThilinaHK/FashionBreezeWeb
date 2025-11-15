import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const config = await request.json();
    
    // In a real app, save to database or environment variables
    // For now, we'll just return success
    console.log('Email config saved:', config);
    
    return NextResponse.json({ success: true, message: 'Email configuration saved' });
  } catch (error) {
    console.error('Error saving email config:', error);
    return NextResponse.json({ error: 'Failed to save email configuration' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // In a real app, load from database
    const config = {
      smtpHost: process.env.SMTP_HOST || '',
      smtpPort: parseInt(process.env.SMTP_PORT || '587'),
      smtpUser: process.env.SMTP_USER || '',
      fromEmail: process.env.FROM_EMAIL || '',
      fromName: process.env.FROM_NAME || 'Fashion Breeze',
      orderStatusEnabled: true,
      newArrivalsEnabled: true
    };
    
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error loading email config:', error);
    return NextResponse.json({ error: 'Failed to load email configuration' }, { status: 500 });
  }
}