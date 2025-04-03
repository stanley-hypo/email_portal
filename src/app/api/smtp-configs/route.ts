import { addSmtpConfig, readSmtpConfigs } from '@/utils/fileUtils';
import { NextResponse } from 'next/server';

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
    console.error('Error reading configurations:', error);
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
    console.error('Error adding configuration:', error);
    return NextResponse.json(
      { error: 'Failed to add configuration' },
      { status: 500 }
    );
  }
} 