import { Router, Request, Response } from 'express';
import multer from 'multer';
import { db } from '../../shared/db';
import { logAudit } from '../../shared/audit';
import {
  sendSubmissionNotification,
  sendApprovalNotification,
  sendRejectionNotification
} from '../notifications/routes';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Generate reference number
function generateReferenceNumber(prefix: string = 'APP'): string {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let random = '';
  for (let i = 0; i < 6; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${year}-${random}`;
}

// Helper: calculate fees for an application
async function calculateApplicationFees(
  serviceId: string,
  formData: Record<string, any>
): Promise<{ total: number; breakdown: { ruleName: string; amount: number; type: string }[] }> {
  try {
    const { data: rules } = await db
      .from('service_fee_rules')
      .select('*')
      .eq('service_id', serviceId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (!rules || rules.length === 0) return { total: 0, breakdown: [] };

    const breakdown: { ruleName: string; amount: number; type: string }[] = [];

    for (const rule of rules) {
      if (rule.condition_field && rule.condition_operator && rule.condition_value !== null) {
        const fieldValue = formData[rule.condition_field];
        let conditionMet = false;
        switch (rule.condition_operator) {
          case 'eq':  conditionMet = String(fieldValue) === String(rule.condition_value); break;
          case 'neq': conditionMet = String(fieldValue) !== String(rule.condition_value); break;
          case 'gt':  conditionMet = Number(fieldValue) > Number(rule.condition_value); break;
          case 'lt':  conditionMet = Number(fieldValue) < Number(rule.condition_value); break;
          case 'gte': conditionMet = Number(fieldValue) >= Number(rule.condition_value); break;
          case 'lte': conditionMet = Number(fieldValue) <= Number(rule.condition_value); break;
          case 'contains': conditionMet = String(fieldValue).toLowerCase().includes(String(rule.condition_value).toLowerCase()); break;
          default: conditionMet = true;
        }
        if (!conditionMet) continue;
      }
      breakdown.push({ ruleName: rule.name, amount: rule.fee_amount, type: rule.fee_type });
    }

    const total = breakdown.reduce((sum, item) => sum + item.amount, 0);
    return { total, breakdown };
  } catch (e) {
    return { total: 0, breakdown: [] };
  }
}

// GET /stats - application stats (before /:id routes)
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { organizationId, serviceId, from, to } = req.query;

    let query = db.from('applications').select('status, service_id, created_at, priority');

    if (organizationId) query = query.eq('organization_id', organizationId as string);
    if (serviceId) query = query.eq('service_id', serviceId as string);
    if (from) query = query.gte('created_at', from as string);
    if (to) query = query.lte('created_at', to as string);

    const { data: applications, error } = await query;
    if (error) throw error;

    const apps = applications || [];

    const byStatus: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    const byDate: Record<string, number> = {};

    for (const app of apps) {
      byStatus[app.status] = (byStatus[app.status] || 0) + 1;
      byPriority[app.priority] = (byPriority[app.priority] || 0) + 1;
      const date = new Date(app.created_at).toISOString().split('T')[0];
      byDate[date] = (byDate[date] || 0) + 1;
    }

    res.json({
      success: true,
      data: {
        total: apps.length,
        byStatus,
        byPriority,
        byDate
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /public/:serviceId - public endpoint for service info (no auth)
router.get('/public/:serviceId', async (req: Request, res: Response) => {
  try {
    const { data: service, error } = await db
      .from('services')
      .select('id, name, description, status, organization_id')
      .eq('id', req.params.serviceId)
      .eq('status', 'live')
      .single();

    if (error || !service) {
      return res.status(404).json({ success: false, error: 'Service not found or not live' });
    }

    const { data: formConfig } = await db
      .from('service_configs')
      .select('config_data')
      .eq('service_id', req.params.serviceId)
      .eq('config_type', 'form_definition')
      .limit(1)
      .single();

    const { data: org } = await db
      .from('organizations')
      .select('name, logo_url, theme_color')
      .eq('id', service.organization_id)
      .single();

    res.json({
      success: true,
      data: {
        service,
        formDefinition: formConfig?.config_data || { sections: [] },
        organization: org
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET / - list applications with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const { serviceId, status, search, organizationId, priority } = req.query;

    let query = db
      .from('applications')
      .select('*', { count: 'exact' });

    if (serviceId) query = query.eq('service_id', serviceId as string);
    if (status) query = query.eq('status', status as string);
    if (organizationId) query = query.eq('organization_id', organizationId as string);
    if (priority) query = query.eq('priority', priority as string);
    if (search) {
      query = query.or(
        `applicant_name.ilike.%${search}%,applicant_email.ilike.%${search}%,reference_number.ilike.%${search}%`
      );
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      success: true,
      data: data || [],
      total: count || 0,
      page,
      limit
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST / - create + submit application
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      service_id,
      organization_id,
      applicant_name,
      applicant_email,
      applicant_phone,
      form_data,
      priority = 'normal',
      is_draft = false
    } = req.body;
    const user = (req as any).user;

    if (!service_id || !applicant_name || !applicant_email || !form_data) {
      return res.status(400).json({
        success: false,
        error: 'service_id, applicant_name, applicant_email, and form_data are required'
      });
    }

    // Get service details
    const { data: service, error: svcError } = await db
      .from('services')
      .select('*')
      .eq('id', service_id)
      .single();

    if (svcError || !service) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }

    // Get workflow to find initial stage
    const { data: wfConfig } = await db
      .from('service_configs')
      .select('config_data')
      .eq('service_id', service_id)
      .eq('config_type', 'workflow_definition')
      .limit(1)
      .single();

    const workflow = (wfConfig?.config_data as any) || { stages: [] };
    const initialStage = workflow.stages.find((s: any) => s.is_initial) || workflow.stages[0];

    // Calculate fees
    const { total: calculatedFee, breakdown: feeBreakdown } = await calculateApplicationFees(service_id, form_data);

    // Generate reference number
    const servicePrefix = (service.name || 'SVC').replace(/\s+/g, '').substring(0, 4).toUpperCase();
    const referenceNumber = generateReferenceNumber(servicePrefix);

    const status = is_draft ? 'draft' : 'submitted';
    const now = new Date().toISOString();

    const { data: application, error } = await db
      .from('applications')
      .insert({
        service_id,
        organization_id: organization_id || service.organization_id,
        applicant_id: user?.id,
        applicant_name,
        applicant_email,
        applicant_phone,
        reference_number: referenceNumber,
        status,
        current_stage: initialStage?.id || null,
        form_data,
        calculated_fee: calculatedFee,
        fee_breakdown: { breakdown: feeBreakdown, total: calculatedFee },
        priority,
        submitted_at: is_draft ? null : now,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (error) throw error;

    // Insert initial timeline entry
    await db.from('application_timeline').insert({
      application_id: application.id,
      to_stage: initialStage?.id || null,
      to_stage_name: initialStage?.name || 'Submitted',
      action_label: is_draft ? 'Draft Created' : 'Application Submitted',
      performed_by: user?.id,
      performed_by_email: user?.email || applicant_email,
      created_at: now
    });

    // Send submission notification if not draft
    if (!is_draft) {
      sendSubmissionNotification(application.id).catch(console.error);
    }

    await logAudit({
      organizationId: application.organization_id,
      userId: user?.id,
      userEmail: user?.email || applicant_email,
      action: 'CREATE',
      resourceType: 'application',
      resourceId: application.id,
      newValues: { reference_number: referenceNumber, status },
      ipAddress: req.ip
    });

    res.status(201).json({ success: true, data: application });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /:id - get full application details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { data: application, error } = await db
      .from('applications')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    // Fetch related data in parallel
    const [timelineResult, documentsResult, queriesResult, paymentResult] = await Promise.all([
      db.from('application_timeline').select('*').eq('application_id', req.params.id).order('created_at', { ascending: true }),
      db.from('application_documents').select('*').eq('application_id', req.params.id).order('created_at', { ascending: false }),
      db.from('application_queries').select('*').eq('application_id', req.params.id).order('created_at', { ascending: false }),
      db.from('payment_transactions').select('*').eq('application_id', req.params.id).order('created_at', { ascending: false }).limit(1).single()
    ]);

    res.json({
      success: true,
      data: {
        ...application,
        timeline: timelineResult.data || [],
        documents: documentsResult.data || [],
        queries: queriesResult.data || [],
        payment: paymentResult.data || null
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /:id - update application (drafts)
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const { data: existing, error: fetchError } = await db
      .from('applications')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !existing) return res.status(404).json({ success: false, error: 'Application not found' });

    const allowedFields = ['form_data', 'priority', 'applicant_phone'];
    const updatePayload: Record<string, any> = { updated_at: new Date().toISOString() };

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updatePayload[field] = req.body[field];
    }

    // Recalculate fees if form_data changed
    if (req.body.form_data) {
      const { total, breakdown } = await calculateApplicationFees(existing.service_id, req.body.form_data);
      updatePayload.calculated_fee = total;
      updatePayload.fee_breakdown = { breakdown, total };
    }

    const { data, error } = await db
      .from('applications')
      .update(updatePayload)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    await logAudit({
      organizationId: existing.organization_id,
      userId: user?.id,
      userEmail: user?.email,
      action: 'UPDATE',
      resourceType: 'application',
      resourceId: req.params.id,
      oldValues: existing,
      newValues: data,
      ipAddress: req.ip
    });

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /:id/documents - list uploaded documents
router.get('/:id/documents', async (req: Request, res: Response) => {
  try {
    const { data, error } = await db
      .from('application_documents')
      .select('*')
      .eq('application_id', req.params.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /:id/documents - upload document
router.post('/:id/documents', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const file = req.file;

    if (!file) return res.status(400).json({ success: false, error: 'No file provided' });

    const { data: application } = await db
      .from('applications')
      .select('id, organization_id')
      .eq('id', req.params.id)
      .single();

    if (!application) return res.status(404).json({ success: false, error: 'Application not found' });

    // Upload to Supabase Storage
    const fileName = `${req.params.id}/${Date.now()}-${file.originalname}`;
    const { data: storageData, error: storageError } = await db.storage
      .from('application-documents')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    let fileUrl = '';
    if (!storageError && storageData) {
      const { data: publicData } = db.storage
        .from('application-documents')
        .getPublicUrl(fileName);
      fileUrl = publicData?.publicUrl || '';
    } else {
      // If storage fails, we still save the record
      console.error('Storage upload error:', storageError);
      fileUrl = `/api/v1/applications/${req.params.id}/documents/file/${fileName}`;
    }

    const { data: doc, error: docError } = await db
      .from('application_documents')
      .insert({
        application_id: req.params.id,
        file_name: file.originalname,
        file_type: file.mimetype,
        file_size: file.size,
        file_url: fileUrl,
        storage_path: fileName,
        document_type: req.body.document_type || 'supporting',
        uploaded_by: user?.id,
        uploaded_by_email: user?.email,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (docError) throw docError;

    await logAudit({
      organizationId: application.organization_id,
      userId: user?.id,
      userEmail: user?.email,
      action: 'UPLOAD',
      resourceType: 'document',
      resourceId: doc.id,
      newValues: { file_name: file.originalname, application_id: req.params.id },
      ipAddress: req.ip
    });

    res.status(201).json({ success: true, data: doc });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /:id/documents/:docId - delete document
router.delete('/:id/documents/:docId', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const { data: doc } = await db
      .from('application_documents')
      .select('*')
      .eq('id', req.params.docId)
      .eq('application_id', req.params.id)
      .single();

    if (!doc) return res.status(404).json({ success: false, error: 'Document not found' });

    // Delete from storage
    if (doc.storage_path) {
      await db.storage.from('application-documents').remove([doc.storage_path]);
    }

    const { error } = await db
      .from('application_documents')
      .delete()
      .eq('id', req.params.docId);

    if (error) throw error;

    await logAudit({
      userId: user?.id,
      userEmail: user?.email,
      action: 'DELETE',
      resourceType: 'document',
      resourceId: req.params.docId,
      oldValues: doc,
      ipAddress: req.ip
    });

    res.json({ success: true, message: 'Document deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
