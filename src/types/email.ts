export interface EmailAttachment {
  filename: string;
  content?: string;       // base64 or utf-8 content string
  path?: string;          // file path or URL
  contentType?: string;   // e.g. application/pdf
  encoding?: string;      // e.g. base64, utf-8
  cid?: string;           // for inline attachments
}

import type { SmtpConfig } from './smtp';

export interface EmailJobPayload {
  config: SmtpConfig;
  to: string;
  subject: string;
  body: string;           // HTML
  fromEmail: string;
  fromName: string;
  attachments?: EmailAttachment[];
}


