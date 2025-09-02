
'use server';

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { z } from 'zod';
import { format } from 'date-fns';

const PaymentSchema = z.object({
  invoice: z.string(),
  date: z.string(),
  course: z.string(),
  amount: z.string(),
  studentName: z.string(),
  studentId: z.string(),
});

type Payment = z.infer<typeof PaymentSchema>;

export async function generatePaymentPdf(payment: Payment): Promise<string> {
    const validatedPayment = PaymentSchema.parse(payment);
    const { invoice, date, course, amount, studentName, studentId } = validatedPayment;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);

    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Header
    page.drawText('Payment Receipt', {
        x: 50,
        y: height - 50,
        font: font,
        size: 24,
        color: rgb(0.1, 0.1, 0.1),
    });
     page.drawText(`Senath Sethmika.lk`, {
      x: width - 150,
      y: height - 50,
      font,
      size: 14,
    });

    // Details
    const detailsYStart = height - 120;
    const details = [
        { label: 'Invoice #:', value: invoice },
        { label: 'Student:', value: studentName },
        { label: 'Date:', value: date },
        { label: 'Course:', value: course },
        { label: 'Amount Paid:', value: amount },
    ];

    details.forEach((detail, index) => {
        const y = detailsYStart - (index * 25);
        page.drawText(detail.label, { x: 50, y, font: regularFont, size: 12, color: rgb(0.4, 0.4, 0.4) });
        page.drawText(detail.value, { x: 150, y, font, size: 12, color: rgb(0.1, 0.1, 0.1) });
    });
    
    // QR Code
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${studentId}`;
    const qrImageBytes = await fetch(qrCodeUrl).then((res) => res.arrayBuffer());
    const qrImage = await pdfDoc.embedPng(qrImageBytes);
    page.drawImage(qrImage, {
        x: width - 100,
        y: 80,
        width: 80,
        height: 80,
    })


    // Footer
    page.drawText('Thank you for your payment!', {
        x: 50,
        y: 100,
        font: regularFont,
        size: 14,
        color: rgb(0.1, 0.1, 0.1),
    });
    
     page.drawText(format(new Date(), 'yyyy-MM-dd HH:mm'), {
      x: width - 120,
      y: 20,
      size: 8,
      font: regularFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes).toString('base64');
}
