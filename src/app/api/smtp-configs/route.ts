import { NextResponse } from 'next/server';
import { readSmtpConfigs, addSmtpConfig } from '@/utils/fileUtils';
import { SmtpConfig } from '@/types/smtp';

function checkAuth(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.split(' ')[1];
  return token === process.env.ADMIN_PASSWORD;
}

export async function GET(request: Request) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const configs = readSmtpConfigs();
    return NextResponse.json(configs);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to read configurations' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const newConfig = addSmtpConfig(data);
    return NextResponse.json(newConfig, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add configuration' },
      { status: 500 }
    );
  }
} 