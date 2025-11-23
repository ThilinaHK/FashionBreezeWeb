import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }
    
    // Simulate sending test email
    console.log(`Sending test email to: ${email}`);
    
    // In a real app, use nodemailer or similar service
    const testEmailContent = {
      to: email,
      subject: 'Fashion Breeze - Test Email',
      html: `
        <h2>Test Email from Fashion Breeze</h2>
        <p>This is a test email to verify your email configuration.</p>
        <p>If you received this email, your email settings are working correctly!</p>
        <br>
        <p>Best regards,<br>Fashion Breeze Team</p>
      `
    };
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test email sent successfully',
      details: testEmailContent 
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json({ error: 'Failed to send test email' }, { status: 500 });
  }
}