import { Router, Request, Response } from 'express';
import { db } from '../../shared/db';
import { logAudit } from '../../shared/audit';

const router = Router();

// GET /categories - list all template categories (must be before /:id)
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const { data, error } = await db
      .from('service_template_definitions')
      .select('category')
      .eq('is_active', true);

    if (error) throw error;

    const categories = [...new Set((data || []).map((t: any) => t.category).filter(Boolean))];
    res.json({ success: true, data: categories });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET / - list all templates with pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const category = req.query.category as string;

    let query = db
      .from('service_template_definitions')
      .select('*', { count: 'exact' });

    if (category) query = query.eq('category', category);

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

// GET /:id - get template details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { data, error } = await db
      .from('service_template_definitions')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, error: 'Template not found' });

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST / - create template
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      category,
      icon,
      base_form,
      base_workflow,
      base_roles,
      base_notifications,
      base_checklist,
      base_fee_rules
    } = req.body;
    const user = (req as any).user;

    if (!name) return res.status(400).json({ success: false, error: 'Template name is required' });

    const { data, error } = await db
      .from('service_template_definitions')
      .insert({
        name,
        description,
        category,
        icon,
        base_form: base_form || {},
        base_workflow: base_workflow || { stages: [] },
        base_roles: base_roles || [],
        base_notifications: base_notifications || {},
        base_checklist: base_checklist || [],
        base_fee_rules: base_fee_rules || [],
        is_active: true,
        created_by: user?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    await logAudit({
      userId: user?.id,
      userEmail: user?.email,
      action: 'CREATE',
      resourceType: 'template',
      resourceId: data.id,
      newValues: data,
      ipAddress: req.ip
    });

    res.status(201).json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /:id - update template
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const { data: existing, error: fetchError } = await db
      .from('service_template_definitions')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !existing) return res.status(404).json({ success: false, error: 'Template not found' });

    const allowedFields = [
      'name', 'description', 'category', 'icon',
      'base_form', 'base_workflow', 'base_roles',
      'base_notifications', 'base_checklist', 'base_fee_rules'
    ];

    const updatePayload: Record<string, any> = { updated_at: new Date().toISOString() };
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updatePayload[field] = req.body[field];
      }
    }

    const { data, error } = await db
      .from('service_template_definitions')
      .update(updatePayload)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    await logAudit({
      userId: user?.id,
      userEmail: user?.email,
      action: 'UPDATE',
      resourceType: 'template',
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

// DELETE /:id - soft delete
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const { data, error } = await db
      .from('service_template_definitions')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    await logAudit({
      userId: user?.id,
      userEmail: user?.email,
      action: 'DELETE',
      resourceType: 'template',
      resourceId: req.params.id,
      ipAddress: req.ip
    });

    res.json({ success: true, message: 'Template deactivated' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /:id/activate - activate template
router.post('/:id/activate', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const { data, error } = await db
      .from('service_template_definitions')
      .update({ is_active: true, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    await logAudit({
      userId: user?.id,
      userEmail: user?.email,
      action: 'ACTIVATE',
      resourceType: 'template',
      resourceId: req.params.id,
      ipAddress: req.ip
    });

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
