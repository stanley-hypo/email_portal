import fs from 'fs';
import path from 'path';
import { SmtpConfig } from '@/types/smtp';

const CONFIG_FILE = path.join(process.cwd(), 'smtp-config.json');

export const readSmtpConfigs = (): SmtpConfig[] => {
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      return [];
    }
    const fileContent = fs.readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading SMTP configs:', error);
    return [];
  }
};

export const writeSmtpConfigs = (configs: SmtpConfig[]): void => {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(configs, null, 2));
  } catch (error) {
    console.error('Error writing SMTP configs:', error);
    throw error;
  }
};

export const addSmtpConfig = (config: Omit<SmtpConfig, 'id'>): SmtpConfig => {
  const configs = readSmtpConfigs();
  const newConfig: SmtpConfig = {
    ...config,
    id: Date.now().toString(),
  };
  configs.push(newConfig);
  writeSmtpConfigs(configs);
  return newConfig;
};

export const updateSmtpConfig = (id: string, config: Partial<SmtpConfig>): SmtpConfig | null => {
  const configs = readSmtpConfigs();
  const index = configs.findIndex((c) => c.id === id);
  if (index === -1) {
    return null;
  }
  const updatedConfig: SmtpConfig = {
    ...configs[index],
    ...config,
    id,
  };
  configs[index] = updatedConfig;
  writeSmtpConfigs(configs);
  return updatedConfig;
};

export const deleteSmtpConfig = (id: string): boolean => {
  const configs = readSmtpConfigs();
  const index = configs.findIndex((c) => c.id === id);
  if (index === -1) {
    return false;
  }
  configs.splice(index, 1);
  writeSmtpConfigs(configs);
  return true;
}; 