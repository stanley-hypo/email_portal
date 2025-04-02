import { Worker, Job } from 'bullmq';
import nodemailer from 'nodemailer';
import { SmtpConfig } from '@/types/smtp';

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

  // Send email
  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    text: body,
  });

  return { success: true };
}, {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

// Handle completed jobs
worker.on('completed', (job: Job<EmailJob>) => {
  console.log(`Email job ${job.id} completed successfully`);
});

// Handle failed jobs
worker.on('failed', (job: Job<EmailJob> | undefined, err: Error) => {
  console.error(`Email job ${job?.id} failed:`, err);
});

export default worker; 