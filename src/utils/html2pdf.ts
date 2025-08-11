// html2pdf.ts
import puppeteer, { Browser, Page } from 'puppeteer';

interface PdfOptions {
  path: string;
  format: 'A4';
  printBackground: boolean;
}

const args: string[] = process.argv.slice(2);
if (args.length < 1) {
  console.error('Usage: node html2pdf.ts <output_pdf_path>');
  process.exit(1);
}

const pdfPath: string = args[0];

// Read HTML from stdin
let html: string = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk: string) => html += chunk);
process.stdin.on('end', async (): Promise<void> => {
  try {
    const browser: Browser = await puppeteer.launch({
      headless: true, // 避免警告
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // for server
    });
    
    const page: Page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfOptions: PdfOptions = {
      path: pdfPath,
      format: 'A4',
      printBackground: true,
    };

    await page.pdf(pdfOptions);
    await browser.close();
    
    console.log(`PDF generated successfully: ${pdfPath}`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    process.exit(1);
  }
});
