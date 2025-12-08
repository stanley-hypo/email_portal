import { NextResponse } from 'next/server';
import { updateSmtpConfig, deleteSmtpConfig } from '@/utils/fileUtils';

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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdminSession();
    if (authResult instanceof NextResponse) return authResult;

    const data = await request.json();
    const id = await params;
    const updatedConfig = updateSmtpConfig(id.id, data);

    if (!updatedConfig) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedConfig);
  } catch (error) {
    console.error('Error updating configuration:', error);
    return NextResponse.json(
      { error: 'Failed to update configuration' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdminSession();
    if (authResult instanceof NextResponse) return authResult;

    const id = await params;
    const deleted = deleteSmtpConfig(id.id);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting configuration:', error);
    return NextResponse.json(
      { error: 'Failed to delete configuration' },
      { status: 500 }
    );
  }
}