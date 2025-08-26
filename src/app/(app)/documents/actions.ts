
'use server';

import { watermarkPdf } from "@/ai/flows/watermark-pdf";

export async function getWatermarkedPdf(fileUrl: string, watermarkText: string): Promise<string> {
    try {
        const result = await watermarkPdf({ fileUrl, watermarkText });
        return result.watermarkedPdf;
    } catch (error) {
        console.error("Error watermarking PDF: ", error);
        throw new Error('Failed to watermark PDF.');
    }
}
