import { Router, Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { db } from '../../shared/db';
import { logAudit } from '../../shared/audit';

const router = Router();

// Create nodemailer transporter
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

// Replace template variables
function replaceVariables(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), value);
  }
  return result;
}

// Internal: send notification email
async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`[EMAIL SIMULATION] To: ${to} | Subject: ${subject}`);
      return true;
    }
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@licensepermits.app',
      to,
      subject,
      html: body
    });
    return true;
  } catch (e) {
    console.error('Email send failed:', e);
    return false;
  }
}

// Internal: log notification
async function logNotification(params: {
  applicationId: string;
  type: string;
  templateType: string;
  recipient: string;
  subject?: string;
  status: 'sent' | 'failed';
  error?: string;
}) {
  try {
    await db.from('notification_logs').insert({
      application_id: params.applicationId,
      type: params.type,
      template_type: params.templateType,
      recipient: params.recipient,
      subject: params.subject,
      status: params.status,
      error_message: params.error,
      created_at: new Date().toISOString()
    });
  } catch (e) {
    console.error('Notification log failed:', e);
  }
}

// Exported helper: send submission notification
export async function sendSubmissionNotification(applicationId: string): Promise<void> {
  try {
    const { data: application } = await db
      .from('applications')
      .select('*, services(name, organization_id), organizations(name)')
      .eq('id', applicationId)
      .single();

    if (!application) return;

    const variables: Record<string, string> = {
      applicant_name: application.applicant_name || 'Applicant',
      reference_number: application.reference_number || applicationId,
      service_name: (application as any).services?.name || 'Service',
      org_name: (application as any).organizations?.name || 'Organization',
      submission_date: new Date().toLocaleDateString()
    };

    const subject = replaceVariables('Application {{reference_number}} Received', variables);
    const body = replaceVariables(
      `<p>Dear {{applicant_name}},</p>
      <p>Thank you for submitting your application for <strong>{{service_name}}</strong>.</p>
      <p>Your reference number is: <strong>{{reference_number}}</strong></p>
      <p>We will review your application and notify you of any updates.</p>
      <p>Submitted on: {{submission_date}}</p>
      <br/><p>Best regards,<br/>{{org_name}}</p>`,
      variables
    );

    const sent = await sendEmail(application.applicant_email, subject, body);
    await logNotification({
      applicationId,
      type: 'email',
      templateType: 'submission',
      recipient: application.applicant_email,
      subject,
      status: sent ? 'sent' : 'failed'
    });
  } catch (e) {
    console.error('Submission notification failed:', e);
  }
}

// Exported helper: send approval notification
export async function sendApprovalNotification(applicationId: string): Promise<void> {
  try {
    const { data: application } = await db
      .from('applications')
      .select('*, services(name), organizations(name)')
      .eq('id', applicationId)
      .single();

    if (!application) return;

    const variables: Record<string, string> = {
      applicant_name: application.applicant_name || 'Applicant',
      reference_number: application.reference_number || applicationId,
      service_name: (application as any).services?.name || 'Service',
      org_name: (application as any).organizations?.name || 'Organization',
      approval_date: new Date().toLocaleDateString()
    };

    const subject = replaceVariables('Application {{reference_number}} Approved', variables);
    const body = replaceVariables(
      `<p>Dear {{applicant_name}},</p>
      <p>We are pleased to inform you that your application for <strong>{{service_name}}</strong> has been <strong>approved</strong>.</p>
      <p>Reference Number: <strong>{{reference_number}}</strong></p>
      <p>Approval Date: {{approval_date}}</p>
      <p>You may download your approval certificate from the portal.</p>
      <br/><p>Best regards,<br/>{{org_name}}</p>`,
      variables
    );

    const sent = await sendEmail(application.applicant_email, subject, body);
    await logNotification({
      applicationId,
      type: 'email',
      templateType: 'approval',
      recipient: application.applicant_email,
      subject,
      status: sent ? 'sent' : 'failed'
    });
  } catch (e) {
    console.error('Approval notification failed:', e);
  }
}

// Exported helper: send rejection notification
export async function sendRejectionNotification(applicationId: string): Promise<void> {
  try {
    const { data: application } = await db
      .from('applications')
      .select('*, services(name), organizations(name)')
      .eq('id', applicationId)
      .single();

    if (!application) return;

    const variables: Record<string, string> = {
      applicant_name: application.applicant_name || 'Applicant',
      reference_number: application.reference_number || applicationId,
      service_name: (application as any).services?.name || 'Service',
      org_name: (application as any).organizations?.name || 'Organization',
      rejection_date: new Date().toLocaleDateString()
    };

    const subject = replaceVariables('Application {{reference_number}} - Decision', variables);
    const body = replaceVariables(
      `<p>Dear {{applicant_name}},</p>
      <p>After careful review, we regret to inform you that your application for <strong>{{service_name}}</strong> has not been approved at this time.</p>
      <p>Reference Number: <strong>{{reference_number}}</strong></p>
      <p>Decision Date: {{rejection_date}}</p>
      <p>If you have questions, please contact our office.</p>
      <br/><p>Best regards,<br/>{{org_name}}</p>`,
      variables
    );

    const sent = await sendEmail(application.applicant_email, subject, body);
    await logNotification({
      applicationId,
      type: 'email',
      templateType: 'rejection',
      recipient: application.applicant_email,
      subject,
      status: sent ? 'sent' : 'failed'
    });
  } catch (e) {
    console.error('Rejection notification failed:', e);
  }
}

// Exported helper: send query notification
export async function sendQueryNotification(applicationId: string, queryText: string): Promise<void> {
  try {
    const { data: application } = await db
      .from('applications')
      .select('*, services(name), organizations(name)')
      .eq('id', applicationId)
      .single();

    if (!application) return;

    const variables: Record<string, string> = {
      applicant_name: application.applicant_name || 'Applicant',
      reference_number: application.reference_number || applicationId,
      service_name: (application as any).services?.name || 'Service',
      org_name: (application as any).organizations?.name || 'Organization',
      query_text: queryText
    };

    const subject = replaceVariables('Action Required: Query on Application {{reference_number}}', variables);
    const body = replaceVariables(
      `<p>Dear {{applicant_name}},</p>
      <p>A query has been raised regarding your application for <strong>{{service_name}}</strong>.</p>
      <p>Reference Number: <strong>{{reference_number}}</strong></p>
      <p><strong>Query:</strong></p>
      <p>{{query_text}}</p>
      <p>Please log in to the portal to respond to this query.</p>
      <br/><p>Best regards,<br/>{{org_name}}</p>`,
      variables
    );

    const sent = await sendEmail(application.applicant_email, subject, body);
    await logNotification({
      applicationId,
      type: 'email',
      templateType: 'query',
      recipient: application.applicant_email,
      subject,
      status: sent ? 'sent' : 'failed'
    });
  } catch (e) {
    console.error('Query notification failed:', e);
  }
}

// Exported helper: send stage transition notification
export async function sendStageNotification(
  applicationId: string,
  stageName: string,
  config: Record<string, any>
): Promise<void> {
  try {
    const { data: application } = await db
      .from('applications')
      .select('*, services(name), organizations(name)')
      .eq('id', applicationId)
      .single();

    if (!application) return;

    const variables: Record<string, string> = {
      applicant_name: application.applicant_name || 'Applicant',
      reference_number: application.reference_number || applicationId,
      service_name: (application as any).services?.name || 'Service',
      org_name: (application as any).organizations?.name || 'Organization',
      stage_name: stageName,
      ...config.variables
    };

    const subject = replaceVariables(config.subject || 'Update on Application {{reference_number}}', variables);
    const body = replaceVariables(
      config.body || `<p>Dear {{applicant_name}},</p><p>Your application {{reference_number}} has moved to stage: <strong>{{stage_name}}</strong>.</p>`,
      variables
    );

    const sent = await sendEmail(application.applicant_email, subject, body);
    await logNotification({
      applicationId,
      type: 'email',
      templateType: 'stage_transition',
      recipient: application.applicant_email,
      subject,
      status: sent ? 'sent' : 'failed'
    });
  } catch (e) {
    console.error('Stage notification failed:', e);
  }
}

// POST /send - send notification manually
router.post('/send', async (req: Request, res: Response) => {
  try {
    const { applicationId, type, templateType, variables } = req.body;
    const user = (req as any).user;

    if (!applicationId || !type || !templateType) {
      return res.status(400).json({ success: false, error: 'applicationId, type, and templateType are required' });
    }

    const { data: application } = await db
      .from('applications')
      .select('*, services(name), organizations(name)')
      .eq('id', applicationId)
      .single();

    if (!application) return res.status(404).json({ success: false, error: 'Application not found' });

    // Load notification template from service_configs
    const { data: configRow } = await db
      .from('service_configs')
      .select('config_data')
      .eq('service_id', application.service_id)
      .eq('config_type', 'notification_templates')
      .limit(1)
      .single();

    const templates = (configRow?.config_data as any) || {};
    const template = templates[templateType] || {};

    const mergedVars: Record<string, string> = {
      applicant_name: application.applicant_name || 'Applicant',
      reference_number: application.reference_number || applicationId,
      service_name: (application as any).services?.name || 'Service',
      org_name: (application as any).organizations?.name || 'Organization',
      ...(variables || {})
    };

    const subject = replaceVariables(template.subject || `Notification: ${templateType}`, mergedVars);
    const body = replaceVariables(template.body || `<p>Dear {{applicant_name}}, update on your application {{reference_number}}.</p>`, mergedVars);

    let status: 'sent' | 'failed' = 'failed';

    if (type === 'email') {
      const sent = await sendEmail(application.applicant_email, subject, body);
      status = sent ? 'sent' : 'failed';
    } else if (type === 'in_app') {
      // In-app notification stored in DB
      await db.from('notification_logs').insert({
        application_id: applicationId,
        type: 'in_app',
        template_type: templateType,
        recipient: application.applicant_id || application.applicant_email,
        subject,
        body,
        status: 'sent',
        created_at: new Date().toISOString()
      });
      status = 'sent';
    } else if (type === 'sms') {
      // SMS placeholder
      console.log(`[SMS SIMULATION] To: ${application.applicant_phone} | Message: ${body}`);
      status = 'sent';
    }

    await logNotification({
      applicationId,
      type,
      templateType,
      recipient: application.applicant_email,
      subject,
      status
    });

    res.json({ success: true, data: { status, recipient: application.applicant_email, subject } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /:applicationId - get notification history
router.get('/:applicationId', async (req: Request, res: Response) => {
  try {
    const { data, error } = await db
      .from('notification_logs')
      .select('*')
      .eq('application_id', req.params.applicationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /templates/:serviceId - get notification templates
router.get('/templates/:serviceId', async (req: Request, res: Response) => {
  try {
    const { data, error } = await db
      .from('service_configs')
      .select('*')
      .eq('service_id', req.params.serviceId)
      .eq('config_type', 'notification_templates')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (!data) {
      const defaultTemplates = {
        submission: {
          subject: 'Application {{reference_number}} Received',
          body: '<p>Dear {{applicant_name}},</p><p>Your application for {{service_name}} has been received. Reference: {{reference_number}}</p>'
        },
        approval: {
          subject: 'Application {{reference_number}} Approved',
          body: '<p>Dear {{applicant_name}},</p><p>Your application {{reference_number}} has been approved.</p>'
        },
        rejection: {
          subject: 'Application {{reference_number}} - Decision',
          body: '<p>Dear {{applicant_name}},</p><p>Your application {{reference_number}} was not approved.</p>'
        },
        query: {
          subject: 'Query on Application {{reference_number}}',
          body: '<p>Dear {{applicant_name}},</p><p>A query has been raised: {{query_text}}</p>'
        }
      };
      return res.json({ success: true, data: defaultTemplates });
    }

    res.json({ success: true, data: data.config_data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /templates/:serviceId - save notification templates
router.put('/templates/:serviceId', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const templates = req.body;

    const { data: existing } = await db
      .from('service_configs')
      .select('id')
      .eq('service_id', req.params.serviceId)
      .eq('config_type', 'notification_templates')
      .limit(1)
      .single();

    let data: any;
    let error: any;

    if (existing) {
      ({ data, error } = await db
        .from('service_configs')
        .update({
          config_data: templates,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single());
    } else {
      ({ data, error } = await db
        .from('service_configs')
        .insert({
          service_id: req.params.serviceId,
          config_type: 'notification_templates',
          config_data: templates,
          version: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single());
    }

    if (error) throw error;

    await logAudit({
      userId: user?.id,
      userEmail: user?.email,
      action: existing ? 'UPDATE' : 'CREATE',
      resourceType: 'notification_templates',
      resourceId: req.params.serviceId,
      ipAddress: req.ip
    });

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
