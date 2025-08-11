import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { PdfConfig } from '@/types/smtp';

const PDF_CONFIG_FILE = path.join(process.cwd(), 'pdf-config.json');

// Helper function to read PDF configurations
async function readPdfConfigs(): Promise<PdfConfig[]> {
  try {
    const data = await fs.readFile(PDF_CONFIG_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading PDF config file:', error);
    return [];
  }
}

// Helper function to write PDF configurations
async function writePdfConfigs(configs: PdfConfig[]): Promise<void> {
  await fs.writeFile(PDF_CONFIG_FILE, JSON.stringify(configs, null, 2));
}

// Helper function to verify auth token
function verifyAuth(request: NextRequest): boolean {
  const authorization = request.headers.get('authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authorization.substring(7);
  return token === process.env.ADMIN_PASSWORD;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const configs = await readPdfConfigs();
    const { id } = await params;
    const configIndex = configs.findIndex(config => config.id === id);

    if (configIndex === -1) {
      return NextResponse.json({ error: 'Configuration not found' }, { status: 404 });
    }

    // If only authTokens is provided, update only that field
    if (body.authTokens && Object.keys(body).length === 1) {
      configs[configIndex].authTokens = body.authTokens;
    } else {
      // Update the configuration with new data
      const { name, ipWhitelist, active } = body;
      configs[configIndex] = {
        ...configs[configIndex],
        name: name || configs[configIndex].name,
        ipWhitelist: ipWhitelist || configs[configIndex].ipWhitelist,
        active: active !== undefined ? active : configs[configIndex].active,
      };
    }

    await writePdfConfigs(configs);
    return NextResponse.json(configs[configIndex]);
  } catch (error) {
    console.error('Error updating PDF configuration:', error);
    return NextResponse.json({ error: 'Failed to update configuration' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const configs = await readPdfConfigs();
    const { id } = await params;
    const configIndex = configs.findIndex(config => config.id === id);

    if (configIndex === -1) {
      return NextResponse.json({ error: 'Configuration not found' }, { status: 404 });
    }

    configs.splice(configIndex, 1);
    await writePdfConfigs(configs);

    return NextResponse.json({ message: 'Configuration deleted successfully' });
  } catch (error) {
    console.error('Error deleting PDF configuration:', error);
    return NextResponse.json({ error: 'Failed to delete configuration' }, { status: 500 });
  }
}
