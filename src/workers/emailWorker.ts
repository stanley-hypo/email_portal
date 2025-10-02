import { Worker, Job } from 'bullmq';
import nodemailer from 'nodemailer';
import { SmtpConfig } from '@/types/smtp';
import { logger } from '@/utils/logger';

interface EmailJob {
  config: SmtpConfig;
  to: string;
  subject: string;
  body: string;
  fromEmail: string;
  fromName: string;
}

// Create email worker
const worker = new Worker('email-queue', async (job: Job<EmailJob>) => {
  const { config, to, subject, body, fromEmail, fromName } = job.data;

  logger.info(`[Worker] Starting job ${job.id} - Sending email to: ${to}`, {
    jobId: job.id,
    to,
    subject,
    smtpHost: config.host,
    smtpPort: config.port,
  });

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.username,
        pass: config.password,
      },
    });

    logger.info(`[Worker] Job ${job.id} - Transporter created, sending email...`);

    // Send email
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html: body,
    });

    logger.success(`[Worker] Job ${job.id} - Email sent successfully`, {
      jobId: job.id,
      to,
      subject,
      messageId: info.messageId,
    });
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`[Worker] Job ${job.id} - ERROR sending email`, {
      jobId: job.id,
      to,
      subject,
      fromEmail,
      fromName,
      smtpHost: config.host,
      smtpPort: config.port,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    // Re-throw to let BullMQ handle the failure
    throw error;
  }
}, {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

// Handle completed jobs
worker.on('completed', (job: Job<EmailJob>) => {
  logger.success(`[Worker] ✓ Email job ${job.id} completed successfully`, {
    jobId: job.id,
    recipient: job.data.to,
    subject: job.data.subject,
  });
});

// Handle failed jobs
worker.on('failed', (job: Job<EmailJob> | undefined, err: Error) => {
  if (job) {
    logger.error(`[Worker] ✗ Email job ${job.id} FAILED`, {
      jobId: job.id,
      recipient: job.data.to,
      subject: job.data.subject,
      smtpHost: job.data.config.host,
      attemptsMade: job.attemptsMade,
      error: err.message,
      stack: err.stack,
    });
  } else {
    logger.error(`[Worker] ✗ Email job FAILED (no job info)`, {
      error: err.message,
      stack: err.stack,
    });
  }
});

export default worker; 