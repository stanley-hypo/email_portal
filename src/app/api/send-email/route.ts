import { NextRequest, NextResponse } from 'next/server';
import { Queue } from 'bullmq';
import { readSmtpConfigs } from '@/utils/fileUtils';
import { SmtpConfig } from '@/types/smtp';
import { logUsageEvent } from '@/utils/usageLogger';
import { timingSafeEqual } from 'crypto';

// Create a BullMQ queue for email processing
const emailQueue = new Queue('email-queue', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

type RateLimitState = { count: number; resetAt: number };
const emailTokenRateLimits = new Map<string, RateLimitState>();
const EMAIL_LIMIT = Math.max(
  1,
  Number(process.env.EMAIL_API_RATE_LIMIT_MAX ?? 60)
);
const EMAIL_WINDOW_MS = Math.max(
  1_000,
  Number(process.env.EMAIL_API_RATE_LIMIT_WINDOW_MS ?? 60_000)
);

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  if (forwarded) return forwarded.split(',')[0].trim();
  if (real) return real;
  return '127.0.0.1';
}

function isIpAllowed(ip: string): boolean {
  const allowlist = process.env.EMAIL_API_IP_ALLOWLIST
    ?.split(',')
    .map((v) => v.trim())
    .filter(Boolean);
  if (!allowlist || allowlist.length === 0) return true;
  return allowlist.includes(ip);
}

function tokensMatch(provided: string, stored: string) {
  if (provided.length !== stored.length) return false;
  try {
    return timingSafeEqual(Buffer.from(provided), Buffer.from(stored));
  } catch {
    return false;
  }
}

function consumeRateLimit(token: string) {
  const now = Date.now();
  const existing = emailTokenRateLimits.get(token);
  if (!existing || existing.resetAt <= now) {
    const fresh = { count: 1, resetAt: now + EMAIL_WINDOW_MS };
    emailTokenRateLimits.set(token, fresh);
    return { ok: true, limit: EMAIL_LIMIT, remaining: EMAIL_LIMIT - 1, resetAt: fresh.resetAt };
  }

  if (existing.count >= EMAIL_LIMIT) {
    const retryAfterSec = Math.max(0, Math.ceil((existing.resetAt - now) / 1000));
    const response = NextResponse.json(
      { error: 'Rate limit exceeded. Please retry later.' },
      {
        status: 429,
        headers: {
          'Retry-After': `${retryAfterSec}`,
          'X-RateLimit-Limit': `${EMAIL_LIMIT}`,
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': `${existing.resetAt}`,
        },
      }
    );
    return { ok: false, response };
  }

  existing.count += 1;
  emailTokenRateLimits.set(token, existing);
  return {
    ok: true,
    limit: EMAIL_LIMIT,
    remaining: EMAIL_LIMIT - existing.count,
    resetAt: existing.resetAt,
  };
}

export async function POST(request: NextRequest) {
  try {
    // Get authorization token from header
    const authToken = request.headers.get('Authorization')?.replace('Bearer ', '').trim();
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authorization token is required' },
        { status: 401 }
      );
    }

    // IP allowlist check (optional)
    const clientIp = getClientIp(request);
    if (!isIpAllowed(clientIp)) {
      return NextResponse.json(
        { error: 'Access denied: IP address not allowed' },
        { status: 403 }
      );
    }

    // Rate limit per token
    const rate = consumeRateLimit(authToken);
    if (!rate.ok) return rate.response;

    // Get request body
    const body = await request.json();
    const { to, subject, body: emailBody, fromEmail, attachments } = body;

    // Validate required fields
    if (!to || !subject || !emailBody || !fromEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, body, fromEmail' },
        { status: 400 }
      );
    }

    // Validate attachments if provided
    if (attachments !== undefined) {
      if (!Array.isArray(attachments)) {
        return NextResponse.json(
          { error: 'attachments must be an array when provided' },
          { status: 400 }
        );
      }
    }

    // Get all SMTP configurations
    const configs = await readSmtpConfigs();
    
    // Find the configuration that matches the fromEmail and contains the authToken
    const config = configs.find((cfg: SmtpConfig) => 
      cfg.fromEmail === fromEmail && 
      cfg.authTokens?.some((token: { token: string; name: string }) => tokensMatch(authToken, token.token))
    );

    if (!config) {
      return NextResponse.json(
        { error: 'Invalid authorization token or email address' },
        { status: 403 }
      );
    }

    if (config.active === false) {
      return NextResponse.json(
        { error: 'SMTP configuration is not active' },
        { status: 403 }
      );
    }

    // Add email to queue
    const job = await emailQueue.add('send-email', {
      config,
      to,
      subject,
      body: emailBody,
      fromEmail,
      fromName: config.fromName,
      attachments,
    });

    // Log queue event
    await logUsageEvent({
      recordId: job.id?.toString() || `${Date.now()}`,
      recordType: "email",
      eventType: "email_sent",
      recipientEmail: to,
      status: "queued",
      source: "api",
      metadata: { subject, fromEmail, fromName: config.fromName },
    });

    const response = NextResponse.json({ 
      message: 'Email queued successfully',
      queueId: job.id?.toString() || null
    });
    response.headers.set('X-RateLimit-Limit', `${rate.limit}`);
    response.headers.set('X-RateLimit-Remaining', `${rate.remaining}`);
    response.headers.set('X-RateLimit-Reset', `${rate.resetAt}`);
    return response;

  } catch (error) {
    console.error('Error processing email request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}