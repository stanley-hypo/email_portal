import fs from 'fs';
import path from 'path';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log file paths
const infoLogPath = path.join(logsDir, 'worker.log');
const errorLogPath = path.join(logsDir, 'worker-error.log');

// Helper to format log messages
function formatLogMessage(level: string, message: string, data?: any): string {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...(data && { data }),
  };
  return JSON.stringify(logEntry) + '\n';
}

// Append to file helper
function appendToFile(filePath: string, content: string): void {
  try {
    fs.appendFileSync(filePath, content, 'utf8');
  } catch (err) {
    console.error(`Failed to write to log file ${filePath}:`, err);
  }
}

export const logger = {
  info: (message: string, data?: any) => {
    const logMessage = formatLogMessage('INFO', message, data);
    appendToFile(infoLogPath, logMessage);
    console.log(message, data || '');
  },

  error: (message: string, data?: any) => {
    const logMessage = formatLogMessage('ERROR', message, data);
    appendToFile(errorLogPath, logMessage);
    appendToFile(infoLogPath, logMessage); // Also write to main log
    console.error(message, data || '');
  },

  success: (message: string, data?: any) => {
    const logMessage = formatLogMessage('SUCCESS', message, data);
    appendToFile(infoLogPath, logMessage);
    console.log(message, data || '');
  },
};

