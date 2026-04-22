import { Router, Request, Response } from 'express';
import { db } from '../../shared/db';
import { logAudit } from '../../shared/audit';

const router = Router();

// GET / - list all organizations
router.get('/', async (req: Request, res: Response) => {
  try {
    const { data, error } = await db
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /:id - get org by id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { data, error } = await db
      .from('organizations')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, error: 'Organization not found' });

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /:id - update org
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, country, department, language, logo_url, theme_color } = req.body;
    const user = (req as any).user;

    const { data: existing, error: fetchError } = await db
      .from('organizations')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !existing) return res.status(404).json({ success: false, error: 'Organization not found' });

    const updatePayload: Record<string, any> = { updated_at: new Date().toISOString() };
    if (name !== undefined) updatePayload.name = name;
    if (country !== undefined) updatePayload.country = country;
    if (department !== undefined) updatePayload.department = department;
    if (language !== undefined) updatePayload.language = language;
    if (logo_url !== undefined) updatePayload.logo_url = logo_url;
    if (theme_color !== undefined) updatePayload.theme_color = theme_color;

    const { data, error } = await db
      .from('organizations')
      .update(updatePayload)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    await logAudit({
      organizationId: req.params.id,
      userId: user?.id,
      userEmail: user?.email,
      action: 'UPDATE',
      resourceType: 'organization',
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

// GET /:id/services - list all services for org
router.get('/:id/services', async (req: Request, res: Response) => {
  try {
    const { data, error } = await db
      .from('services')
      .select('*')
      .eq('organization_id', req.params.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /:id/team - list team members
router.get('/:id/team', async (req: Request, res: Response) => {
  try {
    const { data, error } = await db
      .from('organization_members')
      .select('*')
      .eq('organization_id', req.params.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /:id/team - add team member
router.post('/:id/team', async (req: Request, res: Response) => {
  try {
    const { name, email, role } = req.body;
    const user = (req as any).user;

    if (!name || !email || !role) {
      return res.status(400).json({ success: false, error: 'name, email, and role are required' });
    }

    const { data, error } = await db
      .from('organization_members')
      .insert({
        organization_id: req.params.id,
        name,
        email,
        role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    await logAudit({
      organizationId: req.params.id,
      userId: user?.id,
      userEmail: user?.email,
      action: 'CREATE',
      resourceType: 'team_member',
      resourceId: data.id,
      newValues: data,
      ipAddress: req.ip
    });

    res.status(201).json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /:id/team/:memberId - remove team member
router.delete('/:id/team/:memberId', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const { data: existing } = await db
      .from('organization_members')
      .select('*')
      .eq('id', req.params.memberId)
      .eq('organization_id', req.params.id)
      .single();

    if (!existing) return res.status(404).json({ success: false, error: 'Team member not found' });

    const { error } = await db
      .from('organization_members')
      .delete()
      .eq('id', req.params.memberId)
      .eq('organization_id', req.params.id);

    if (error) throw error;

    await logAudit({
      organizationId: req.params.id,
      userId: user?.id,
      userEmail: user?.email,
      action: 'DELETE',
      resourceType: 'team_member',
      resourceId: req.params.memberId,
      oldValues: existing,
      ipAddress: req.ip
    });

    res.json({ success: true, message: 'Team member removed' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /:id/stats - org stats
router.get('/:id/stats', async (req: Request, res: Response) => {
  try {
    const orgId = req.params.id;

    const [servicesResult, applicationsResult, liveServicesResult] = await Promise.all([
      db.from('services').select('id', { count: 'exact', head: true }).eq('organization_id', orgId),
      db.from('applications').select('id', { count: 'exact', head: true }).eq('organization_id', orgId),
      db.from('services').select('id', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'live')
    ]);

    const totalServices = servicesResult.count || 0;
    const totalApplications = applicationsResult.count || 0;
    const liveServices = liveServicesResult.count || 0;

    // Applications by status
    const { data: statusData } = await db
      .from('applications')
      .select('status')
      .eq('organization_id', orgId);

    const applicationsByStatus: Record<string, number> = {};
    (statusData || []).forEach((app: any) => {
      applicationsByStatus[app.status] = (applicationsByStatus[app.status] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        totalServices,
        totalApplications,
        liveServices,
        applicationsByStatus
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
