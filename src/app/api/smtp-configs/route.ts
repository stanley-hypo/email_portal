import { addSmtpConfig, readSmtpConfigs } from '@/utils/fileUtils';
import { NextResponse } from 'next/server';

import { auth } from "@/lib/auth";

async function requireAdminSession() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!session.user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return session;
}

export async function GET() {
  try {
    const authResult = await requireAdminSession();
    if (authResult instanceof NextResponse) return authResult;

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
    const authResult = await requireAdminSession();
    if (authResult instanceof NextResponse) return authResult;

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