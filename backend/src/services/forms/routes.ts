import { Router, Request, Response } from 'express';
import { db } from '../../shared/db';
import { logAudit } from '../../shared/audit';

const router = Router();

// GET /:serviceId - get form definition for a service
router.get('/:serviceId', async (req: Request, res: Response) => {
  try {
    const { data, error } = await db
      .from('service_configs')
      .select('*')
      .eq('service_id', req.params.serviceId)
      .eq('config_type', 'form_definition')
      .order('version', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (!data) {
      return res.json({
        success: true,
        data: {
          service_id: req.params.serviceId,
          config_type: 'form_definition',
          config_data: { sections: [], version: 1 },
          version: 1
        }
      });
    }

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /:serviceId - save/update form definition
router.put('/:serviceId', async (req: Request, res: Response) => {
  try {
    const { sections, version } = req.body;
    const user = (req as any).user;

    if (!sections) return res.status(400).json({ success: false, error: 'sections is required' });

    // Check if form definition already exists
    const { data: existing } = await db
      .from('service_configs')
      .select('id')
      .eq('service_id', req.params.serviceId)
      .eq('config_type', 'form_definition')
      .limit(1)
      .single();

    const configData = { sections, version: version || 1 };

    let data: any;
    let error: any;

    if (existing) {
      ({ data, error } = await db
        .from('service_configs')
        .update({
          config_data: configData,
          version: version || 1,
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
          config_type: 'form_definition',
          config_data: configData,
          version: version || 1,
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
      resourceType: 'form_definition',
      resourceId: req.params.serviceId,
      newValues: configData,
      ipAddress: req.ip
    });

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /validate - validate form data against service form definition
router.post('/validate', async (req: Request, res: Response) => {
  try {
    const { serviceId, formData } = req.body;

    if (!serviceId || !formData) {
      return res.status(400).json({ success: false, error: 'serviceId and formData are required' });
    }

    const { data: configRow, error } = await db
      .from('service_configs')
      .select('config_data')
      .eq('service_id', serviceId)
      .eq('config_type', 'form_definition')
      .order('version', { ascending: false })
      .limit(1)
      .single();

    if (error || !configRow) {
      return res.json({ success: true, valid: true, errors: [], message: 'No form definition found, validation skipped' });
    }

    const formDef = configRow.config_data as any;
    const sections = formDef.sections || [];
    const validationErrors: { field: string; message: string }[] = [];

    for (const section of sections) {
      const fields = section.fields || [];
      for (const field of fields) {
        const value = formData[field.id];

        // Required check
        if (field.required && (value === undefined || value === null || value === '')) {
          validationErrors.push({ field: field.id, message: `${field.label || field.id} is required` });
          continue;
        }

        if (value === undefined || value === null || value === '') continue;

        // Type-specific validation
        if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          validationErrors.push({ field: field.id, message: `${field.label || field.id} must be a valid email` });
        }

        if (field.type === 'number' || field.type === 'integer') {
          const num = Number(value);
          if (isNaN(num)) {
            validationErrors.push({ field: field.id, message: `${field.label || field.id} must be a number` });
          } else {
            if (field.min !== undefined && num < field.min) {
              validationErrors.push({ field: field.id, message: `${field.label || field.id} must be at least ${field.min}` });
            }
            if (field.max !== undefined && num > field.max) {
              validationErrors.push({ field: field.id, message: `${field.label || field.id} must be at most ${field.max}` });
            }
          }
        }

        if (field.type === 'text' || field.type === 'textarea') {
          if (field.minLength && String(value).length < field.minLength) {
            validationErrors.push({ field: field.id, message: `${field.label || field.id} must be at least ${field.minLength} characters` });
          }
          if (field.maxLength && String(value).length > field.maxLength) {
            validationErrors.push({ field: field.id, message: `${field.label || field.id} must be at most ${field.maxLength} characters` });
          }
        }

        if (field.pattern) {
          const regex = new RegExp(field.pattern);
          if (!regex.test(String(value))) {
            validationErrors.push({ field: field.id, message: field.patternMessage || `${field.label || field.id} has invalid format` });
          }
        }
      }
    }

    res.json({
      success: true,
      valid: validationErrors.length === 0,
      errors: validationErrors
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /:serviceId/fields - get flat list of all fields in a form
router.get('/:serviceId/fields', async (req: Request, res: Response) => {
  try {
    const { data: configRow, error } = await db
      .from('service_configs')
      .select('config_data')
      .eq('service_id', req.params.serviceId)
      .eq('config_type', 'form_definition')
      .order('version', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (!configRow) {
      return res.json({ success: true, data: [] });
    }

    const formDef = configRow.config_data as any;
    const sections = formDef.sections || [];
    const fields: any[] = [];

    for (const section of sections) {
      for (const field of (section.fields || [])) {
        fields.push({
          id: field.id,
          label: field.label || field.id,
          type: field.type || 'text',
          section: section.title || section.id,
          required: field.required || false,
          options: field.options || null
        });
      }
    }

    res.json({ success: true, data: fields });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
