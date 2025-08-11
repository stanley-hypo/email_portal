import { NextRequest, NextResponse } from 'next/server';
import puppeteer, { Browser, Page } from 'puppeteer';
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

// Helper function to check if IP is in whitelist
function isIpWhitelisted(clientIp: string, whitelist: string[]): boolean {
  if (whitelist.length === 0) {
    return true; // No restrictions if whitelist is empty
  }
  return whitelist.includes(clientIp);
}

// Helper function to get client IP
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (real) {
    return real;
  }
  
  // Fallback to localhost for development
  return '127.0.0.1';
}

export async function POST(request: NextRequest) {
  console.log('HTML to PDF request received');
  
  try {
    // Get authorization token from header
    const authToken = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!authToken) {
      console.log('HTML to PDF: No auth token provided');
      return NextResponse.json(
        { error: 'Authorization token is required' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    console.log('HTML to PDF body keys:', Object.keys(body));
    const { html, filename, options } = body;

    // Validate required fields
    if (!html) {
      console.log('HTML to PDF: Missing HTML content');
      return NextResponse.json(
        { error: 'HTML content is required' },
        { status: 400 }
      );
    }

    // Get all PDF configurations
    const configs = await readPdfConfigs();
    console.log('PDF configs count:', configs.length);
    
    // Find the configuration that contains the authToken
    const config = configs.find((cfg: PdfConfig) => 
      cfg.authTokens?.some((token: { token: string; name: string }) => token.token === authToken)
    );

    if (!config) {
      console.log('HTML to PDF: Invalid auth token');
      return NextResponse.json(
        { error: 'Invalid authorization token' },
        { status: 403 }
      );
    }

    if (!config.active) {
      console.log('HTML to PDF: Config not active');
      return NextResponse.json(
        { error: 'PDF configuration is not active' },
        { status: 403 }
      );
    }

    // Check IP whitelist
    const clientIp = getClientIp(request);
    console.log('Client IP:', clientIp, 'Whitelist:', config.ipWhitelist);
    
    if (!isIpWhitelisted(clientIp, config.ipWhitelist)) {
      console.log('HTML to PDF: IP not whitelisted');
      return NextResponse.json(
        { error: 'Access denied: IP address not whitelisted' },
        { status: 403 }
      );
    }

    // Generate PDF using Puppeteer
    console.log('Starting PDF generation');
    const browser: Browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // for server environment
    });
    
    const page: Page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // PDF options with defaults
    const pdfOptions = {
      format: options?.format || 'A4' as const,
      printBackground: options?.printBackground !== false,
      margin: options?.margin || {
        top: '1cm',
        right: '1cm',
        bottom: '1cm',
        left: '1cm'
      },
      ...options
    };

    const pdfBuffer = await page.pdf(pdfOptions);
    await browser.close();
    
    console.log('PDF generated successfully, size:', pdfBuffer.length);

    // Set response headers for PDF download
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Length', pdfBuffer.length.toString());
    
    if (filename) {
      headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    } else {
      headers.set('Content-Disposition', `attachment; filename="document_${Date.now()}.pdf"`);
    }

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
