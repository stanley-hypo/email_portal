import { NextRequest, NextResponse } from 'next/server';
import { Queue } from 'bullmq';
import { readSmtpConfigs } from '@/utils/fileUtils';
import { SmtpConfig } from '@/types/smtp';

// Create a BullMQ queue for email processing
const emailQueue = new Queue('email-queue', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

export async function POST(request: NextRequest) {
  try {
    // Get authorization token from header
    const authToken = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authorization token is required' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { to, subject, body: emailBody, fromEmail } = body;

    // Validate required fields
    if (!to || !subject || !emailBody || !fromEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, body, fromEmail' },
        { status: 400 }
      );
    }

    // Get all SMTP configurations
    const configs = await readSmtpConfigs();
    
    // Find the configuration that matches the fromEmail and contains the authToken
    const config = configs.find((cfg: SmtpConfig) => 
      cfg.fromEmail === fromEmail && 
      cfg.authTokens?.some((token: { token: string; name: string }) => token.token === authToken)
    );

    if (!config) {
      return NextResponse.json(
        { error: 'Invalid authorization token or email address' },
        { status: 403 }
      );
    }

    // Add email to queue
    await emailQueue.add('send-email', {
      config,
      to,
      subject,
      body: emailBody,
      fromEmail,
      fromName: config.fromName,
    });

    return NextResponse.json({ 
      message: 'Email queued successfully',
      queueId: Date.now().toString()
    });

  } catch (error) {
    console.error('Error processing email request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 