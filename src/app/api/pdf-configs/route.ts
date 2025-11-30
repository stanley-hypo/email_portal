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

import { auth } from "@/lib/auth";

// ... (keep existing imports)

// Remove verifyAuth function

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ... (keep existing code)

  try {
    const configs = await readPdfConfigs();
    return NextResponse.json(configs);
  } catch (error) {
    console.error('Error reading PDF configurations:', error);
    return NextResponse.json({ error: 'Failed to read configurations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log('PDF POST request received');

  const session = await auth();
  if (!session) {
    console.log('PDF POST: Auth failed');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    console.log('PDF POST body:', body);
    const { name, ipWhitelist, active } = body;

    if (!name) {
      console.log('PDF POST: Name is missing');
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // ipWhitelist is optional, but if provided, must be an array
    if (ipWhitelist !== undefined && !Array.isArray(ipWhitelist)) {
      console.log('PDF POST: Invalid IP whitelist format');
      return NextResponse.json({ error: 'IP whitelist must be an array' }, { status: 400 });
    }

    const configs = await readPdfConfigs();
    console.log('PDF POST: Current configs count:', configs.length);

    const newConfig: PdfConfig = {
      id: Date.now().toString(),
      name,
      ipWhitelist: ipWhitelist || [], // Default to empty array if not provided
      authTokens: [],
      active: active !== undefined ? active : true,
    };

    configs.push(newConfig);
    await writePdfConfigs(configs);
    console.log('PDF POST: Config saved successfully');

    return NextResponse.json(newConfig, { status: 201 });
  } catch (error) {
    console.error('Error creating PDF configuration:', error);
    return NextResponse.json({
      error: 'Failed to create configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
