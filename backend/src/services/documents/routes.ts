import { Router, Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import { db } from '../../shared/db';
import { logAudit } from '../../shared/audit';

const router = Router();

// Helper: upload PDF buffer to Supabase Storage
async function uploadPdfToStorage(buffer: Buffer, path: string): Promise<string> {
  const { data, error } = await db.storage
    .from('generated-documents')
    .upload(path, buffer, {
      contentType: 'application/pdf',
      upsert: true
    });

  if (error) throw error;

  const { data: publicData } = db.storage
    .from('generated-documents')
    .getPublicUrl(path);

  return publicData?.publicUrl || '';
}

// Helper: generate certificate PDF
async function generateCertificatePDF(
  application: any,
  service: any,
  org: any
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 60, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const orgName = org?.name || 'Government Organization';
    const serviceName = service?.name || 'License/Permit';
    const applicantName = application.applicant_name || 'Applicant';
    const refNumber = application.reference_number || application.id;
    const approvalDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const validDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Border
    doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).stroke('#ccaa44');
    doc.rect(35, 35, doc.page.width - 70, doc.page.height - 70).stroke('#ccaa44');

    // Header
    doc.moveDown(1);
    doc.fontSize(28).font('Helvetica-Bold').fillColor('#1a3a6b').text(orgName.toUpperCase(), { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(14).font('Helvetica').fillColor('#555').text('Official Certificate of Approval', { align: 'center' });
    doc.moveDown(1);

    // Divider
    doc.moveTo(80, doc.y).lineTo(doc.page.width - 80, doc.y).lineWidth(2).strokeColor('#ccaa44').stroke();
    doc.moveDown(1);

    // Certificate body
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#222').text('CERTIFICATE OF APPROVAL', { align: 'center' });
    doc.moveDown(1);

    doc.fontSize(12).font('Helvetica').fillColor('#333').text(
      `This is to certify that the application for`,
      { align: 'center' }
    );
    doc.moveDown(0.5);
    doc.fontSize(18).font('Helvetica-Bold').fillColor('#1a3a6b').text(serviceName, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica').fillColor('#333').text('has been granted to:', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(20).font('Helvetica-Bold').fillColor('#222').text(applicantName, { align: 'center' });
    doc.moveDown(1);

    // Details table
    const tableX = 100;
    const tableWidth = doc.page.width - 200;
    const rowHeight = 28;
    const rows = [
      ['Reference Number:', refNumber],
      ['Date of Approval:', approvalDate],
      ['Valid Until:', validDate],
      ['Email:', application.applicant_email || 'N/A'],
    ];

    for (const [label, value] of rows) {
      doc.rect(tableX, doc.y, tableWidth / 2, rowHeight).fillAndStroke('#f0f4f8', '#ddd');
      doc.rect(tableX + tableWidth / 2, doc.y - rowHeight, tableWidth / 2, rowHeight).fillAndStroke('#fff', '#ddd');
      doc.fillColor('#555').fontSize(10).font('Helvetica-Bold').text(label, tableX + 10, doc.y - rowHeight + 8);
      doc.fillColor('#222').font('Helvetica').text(value, tableX + tableWidth / 2 + 10, doc.y - rowHeight + 8);
      doc.moveDown(0.1);
    }

    doc.moveDown(2);

    // Official seal placeholder
    doc.circle(doc.page.width / 2, doc.y + 40, 45).stroke('#1a3a6b');
    doc.fontSize(9).fillColor('#1a3a6b').text('OFFICIAL SEAL', doc.page.width / 2 - 30, doc.y + 25);
    doc.moveDown(5);

    // Signature line
    const sigY = doc.page.height - 150;
    doc.moveTo(100, sigY).lineTo(250, sigY).lineWidth(1).strokeColor('#333').stroke();
    doc.fontSize(10).fillColor('#333').text('Authorized Signature', 100, sigY + 5);

    doc.moveTo(doc.page.width - 250, sigY).lineTo(doc.page.width - 100, sigY).stroke();
    doc.text('Date', doc.page.width - 250, sigY + 5);

    // Footer
    doc.fontSize(8).fillColor('#888').text(
      `This certificate is issued by ${orgName} and is valid until ${validDate}. Reference: ${refNumber}`,
      { align: 'center' }
    );

    doc.end();
  });
}

// Helper: generate acknowledgement PDF
async function generateAcknowledgementPDF(application: any, service: any, org: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const orgName = org?.name || 'Government Organization';
    const serviceName = service?.name || 'Service';

    doc.fontSize(20).font('Helvetica-Bold').text(orgName, { align: 'center' });
    doc.fontSize(14).font('Helvetica').text('Application Acknowledgement', { align: 'center' });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    doc.fontSize(12).font('Helvetica').text(`Dear ${application.applicant_name},`);
    doc.moveDown(0.5);
    doc.text(
      `This is to acknowledge that we have received your application for ${serviceName}. ` +
      `Your application is currently under review.`
    );
    doc.moveDown();

    const rows = [
      ['Reference Number:', application.reference_number],
      ['Service:', serviceName],
      ['Submission Date:', new Date(application.submitted_at || application.created_at).toLocaleDateString()],
      ['Status:', application.status.replace(/_/g, ' ').toUpperCase()],
    ];

    for (const [label, value] of rows) {
      doc.font('Helvetica-Bold').text(label, { continued: true, width: 200 });
      doc.font('Helvetica').text(` ${value}`);
    }

    doc.moveDown();
    doc.font('Helvetica').text('We will notify you of any updates. Please retain this document for your records.');
    doc.moveDown(2);
    doc.fontSize(8).fillColor('#888').text(`Generated on ${new Date().toLocaleString()}`, { align: 'center' });

    doc.end();
  });
}

// Helper: generate rejection letter PDF
async function generateRejectionLetterPDF(application: any, service: any, org: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const orgName = org?.name || 'Government Organization';
    const serviceName = service?.name || 'Service';

    doc.fontSize(20).font('Helvetica-Bold').text(orgName, { align: 'center' });
    doc.fontSize(12).font('Helvetica').text('Official Communication', { align: 'center' });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    doc.fontSize(10).text(new Date().toLocaleDateString());
    doc.moveDown();
    doc.fontSize(12).text(`Ref: ${application.reference_number}`);
    doc.moveDown();
    doc.font('Helvetica-Bold').text(`Dear ${application.applicant_name},`);
    doc.moveDown(0.5);
    doc.font('Helvetica').text(`Subject: Application for ${serviceName} — Decision`);
    doc.moveDown();
    doc.text(
      `After careful review of your application (Reference: ${application.reference_number}) ` +
      `for ${serviceName}, we regret to inform you that your application has not been approved at this time.`
    );
    doc.moveDown();
    doc.text(
      `If you wish to appeal this decision or have questions, please contact our office within 30 days ` +
      `of receiving this letter.`
    );
    doc.moveDown(2);
    doc.text('Sincerely,');
    doc.moveDown(2);
    doc.text(`${orgName}`);
    doc.text('Licensing Department');

    doc.end();
  });
}

// POST /generate - generate a document
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { applicationId, documentType } = req.body;
    const user = (req as any).user;

    if (!applicationId || !documentType) {
      return res.status(400).json({ success: false, error: 'applicationId and documentType are required' });
    }

    const validTypes = ['certificate', 'receipt', 'acknowledgement', 'rejection_letter'];
    if (!validTypes.includes(documentType)) {
      return res.status(400).json({ success: false, error: `documentType must be one of: ${validTypes.join(', ')}` });
    }

    const { data: application, error: appError } = await db
      .from('applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    const [serviceResult, orgResult] = await Promise.all([
      db.from('services').select('*').eq('id', application.service_id).single(),
      db.from('organizations').select('*').eq('id', application.organization_id).single()
    ]);

    const service = serviceResult.data;
    const org = orgResult.data;

    let pdfBuffer: Buffer;

    switch (documentType) {
      case 'certificate':
        pdfBuffer = await generateCertificatePDF(application, service, org);
        break;
      case 'acknowledgement':
        pdfBuffer = await generateAcknowledgementPDF(application, service, org);
        break;
      case 'rejection_letter':
        pdfBuffer = await generateRejectionLetterPDF(application, service, org);
        break;
      case 'receipt': {
        // Generate receipt from latest payment transaction
        const { data: transaction } = await db
          .from('payment_transactions')
          .select('*')
          .eq('application_id', applicationId)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
          const doc = new PDFDocument({ margin: 50 });
          const chunks: Buffer[] = [];
          doc.on('data', c => chunks.push(c));
          doc.on('end', () => resolve(Buffer.concat(chunks)));
          doc.on('error', reject);

          doc.fontSize(20).font('Helvetica-Bold').text(org?.name || 'Organization', { align: 'center' });
          doc.fontSize(14).font('Helvetica').text('Payment Receipt', { align: 'center' });
          doc.moveDown();
          doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
          doc.moveDown();

          if (transaction) {
            const rows = [
              ['Receipt Number:', transaction.receipt_number || transaction.id],
              ['Application Ref:', application.reference_number],
              ['Applicant:', application.applicant_name],
              ['Service:', service?.name || 'N/A'],
              ['Amount:', `$${Number(transaction.amount).toFixed(2)}`],
              ['Method:', transaction.payment_method.replace(/_/g, ' ').toUpperCase()],
              ['Date:', transaction.payment_date ? new Date(transaction.payment_date).toLocaleDateString() : 'N/A'],
              ['Status:', 'PAID']
            ];
            for (const [label, value] of rows) {
              doc.font('Helvetica-Bold').text(label, { continued: true, width: 200 });
              doc.font('Helvetica').text(` ${value}`);
            }
          } else {
            doc.text('No completed payment found for this application.');
          }

          doc.moveDown(2);
          doc.fontSize(8).fillColor('#888').text(`Generated on ${new Date().toLocaleString()}`, { align: 'center' });
          doc.end();
        });
        break;
      }
      default:
        return res.status(400).json({ success: false, error: 'Invalid document type' });
    }

    // Upload to storage
    const storagePath = `${applicationId}/${documentType}-${Date.now()}.pdf`;
    let downloadUrl = '';

    try {
      downloadUrl = await uploadPdfToStorage(pdfBuffer, storagePath);
    } catch (storageErr) {
      console.error('Storage upload failed, serving directly:', storageErr);
    }

    // Save to generated_documents table
    const { data: docRecord, error: docError } = await db
      .from('generated_documents')
      .insert({
        application_id: applicationId,
        document_type: documentType,
        file_name: `${documentType}-${application.reference_number}.pdf`,
        file_size: pdfBuffer.length,
        storage_path: storagePath,
        download_url: downloadUrl,
        generated_by: user?.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (docError) {
      console.error('Failed to save document record:', docError);
    }

    await logAudit({
      organizationId: application.organization_id,
      userId: user?.id,
      userEmail: user?.email,
      action: 'GENERATE_DOCUMENT',
      resourceType: 'document',
      resourceId: docRecord?.id || applicationId,
      newValues: { documentType, applicationId },
      ipAddress: req.ip
    });

    // If we have a storage URL, redirect/return it; otherwise serve inline
    if (downloadUrl) {
      return res.json({
        success: true,
        data: {
          documentId: docRecord?.id,
          downloadUrl,
          documentType,
          fileName: `${documentType}-${application.reference_number}.pdf`
        }
      });
    }

    // Serve PDF directly
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${documentType}-${application.reference_number}.pdf"`);
    res.send(pdfBuffer);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /:documentId/download - stream PDF download
router.get('/:documentId/download', async (req: Request, res: Response) => {
  try {
    const { data: doc, error } = await db
      .from('generated_documents')
      .select('*')
      .eq('id', req.params.documentId)
      .single();

    if (error || !doc) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    if (doc.download_url) {
      return res.redirect(doc.download_url);
    }

    // Try to download from storage
    if (doc.storage_path) {
      const { data: fileData, error: dlError } = await db.storage
        .from('generated-documents')
        .download(doc.storage_path);

      if (dlError) throw dlError;

      const arrayBuffer = await fileData.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${doc.file_name}"`);
      return res.send(buffer);
    }

    res.status(404).json({ success: false, error: 'Document file not available' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /application/:applicationId - list all generated documents
router.get('/application/:applicationId', async (req: Request, res: Response) => {
  try {
    const { data, error } = await db
      .from('generated_documents')
      .select('*')
      .eq('application_id', req.params.applicationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
