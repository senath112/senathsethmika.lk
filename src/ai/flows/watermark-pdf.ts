
'use server';

/**
 * @fileOverview A Genkit flow for adding a watermark to a PDF document.
 *
 * - watermarkPdf - A function that adds a watermark to a PDF.
 * - WatermarkPdfInput - The input type for the watermarkPdf function.
 * - WatermarkPdfOutput - The return type for the watermarkPdf function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const WatermarkPdfInputSchema = z.object({
  fileUrl: z.string().url().describe('The URL of the PDF file to watermark.'),
  watermarkText: z.string().describe('The text to use as the watermark.'),
});
export type WatermarkPdfInput = z.infer<typeof WatermarkPdfInputSchema>;

const WatermarkPdfOutputSchema = z.object({
  watermarkedPdf: z.string().describe('The watermarked PDF file as a Base64 encoded string.'),
});
export type WatermarkPdfOutput = z.infer<typeof WatermarkPdfOutputSchema>;


export async function watermarkPdf(input: WatermarkPdfInput): Promise<WatermarkPdfOutput> {
  return watermarkPdfFlow(input);
}


const watermarkPdfFlow = ai.defineFlow(
  {
    name: 'watermarkPdfFlow',
    inputSchema: WatermarkPdfInputSchema,
    outputSchema: WatermarkPdfOutputSchema,
  },
  async ({ fileUrl, watermarkText }) => {
    
    // Fetch the PDF from the URL
    const existingPdfBytes = await fetch(fileUrl).then(res => res.arrayBuffer());

    // Load a PDFDocument from the existing PDF bytes
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Embed the Helvetica font
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Get the pages of the document
    const pages = pdfDoc.getPages();

    // Add a watermark to each page
    for (const page of pages) {
      const { width, height } = page.getSize();
      page.drawText(watermarkText, {
        x: width - 120,
        y: 20,
        size: 10,
        font: helveticaFont,
        color: rgb(0.5, 0.5, 0.5),
        opacity: 0.5,
      });
    }

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await pdfDoc.save();
    
    // Convert Uint8Array to Base64 string
    const watermarkedPdf = Buffer.from(pdfBytes).toString('base64');
    
    return { watermarkedPdf };
  }
);
