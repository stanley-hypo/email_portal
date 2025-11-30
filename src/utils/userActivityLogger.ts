import fs from 'fs';
import path from 'path';
import { logger } from './logger';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// User activity log file path
const userActivityLogPath = path.join(logsDir, 'user-activity.log');

type UserActivityAction = 
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | 'PASSWORD_CHANGED'
  | 'PASSWORD_RESET'
  | 'ADMIN_ACCESS_DENIED';

interface UserActivityData {
  action: UserActivityAction;
  actorId?: string;
  actorEmail?: string;
  targetUserId?: string;
  targetUserEmail?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

// Helper to format user activity log messages
function formatUserActivityLog(data: UserActivityData): string {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    ...data,
  };
  return JSON.stringify(logEntry) + '\n';
}

// Append to file helper
function appendToFile(filePath: string, content: string): void {
  try {
    fs.appendFileSync(filePath, content, 'utf8');
  } catch (err) {
    console.error(`Failed to write to user activity log file ${filePath}:`, err);
  }
}

export const userActivityLogger = {
  log: (data: UserActivityData) => {
    const logMessage = formatUserActivityLog(data);
    appendToFile(userActivityLogPath, logMessage);
    // Also log to main logger for visibility
    logger.info(`[User Activity] ${data.action}`, {
      actorId: data.actorId,
      actorEmail: data.actorEmail,
      targetUserId: data.targetUserId,
      targetUserEmail: data.targetUserEmail,
      ...data.details,
    });
  },
};

