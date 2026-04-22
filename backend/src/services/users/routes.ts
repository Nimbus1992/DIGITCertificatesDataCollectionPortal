import { Router, Request, Response } from 'express';
import { db } from '../../shared/db';
import { logAudit } from '../../shared/audit';

const router = Router();

/**
 * POST /api/v1/users/invite
 * Invite a user by email — creates them in auth.users (invited state)
 * and inserts a team_members record.
 *
 * Body: { email, name, role, organizationId, serviceId? }
 */
router.post('/invite', async (req: Request, res: Response) => {
  try {
    const { email, name, role, organizationId, serviceId } = req.body;
    const actor = (req as any).user;

    if (!email || !name || !role || !organizationId) {
      return res.status(400).json({ success: false, error: 'email, name, role, and organizationId are required' });
    }

    // 1. Invite user via Supabase Auth Admin API — creates auth.users row with invited_at set
    const { data: inviteData, error: inviteError } = await db.auth.admin.inviteUserByEmail(email, {
      data: { name, role, organization_id: organizationId },
      redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/onboarding`,
    });

    if (inviteError) {
      // If user already exists in auth, that's OK — we still create the team_member record
      if (!inviteError.message?.toLowerCase().includes('already been registered')) {
        return res.status(400).json({ success: false, error: inviteError.message });
      }
    }

    // 2. Upsert team_members record
    const { data: member, error: memberError } = await db
      .from('team_members')
      .upsert(
        {
          organization_id: organizationId,
          service_id: serviceId || null,
          name,
          email: email.toLowerCase(),
          role,
          status: 'pending',
        },
        { onConflict: 'organization_id,email', ignoreDuplicates: false }
      )
      .select()
      .single();

    if (memberError) throw memberError;

    await logAudit({
      organizationId,
      userId: actor?.id,
      userEmail: actor?.email,
      action: 'CREATE',
      resourceType: 'team_member',
      resourceId: member.id,
      newValues: { email, name, role, serviceId: serviceId || null },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      data: {
        member,
        authUserId: inviteData?.user?.id ?? null,
        invited: !!inviteData?.user,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/v1/users/:memberId/status
 * Set a team member's status: active | inactive | pending
 */
router.patch('/:memberId/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const actor = (req as any).user;

    if (!['active', 'inactive', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, error: 'status must be active, inactive, or pending' });
    }

    const { data, error } = await db
      .from('team_members')
      .update({ status })
      .eq('id', req.params.memberId)
      .select()
      .single();

    if (error) throw error;

    await logAudit({
      organizationId: data.organization_id,
      userId: actor?.id,
      userEmail: actor?.email,
      action: 'UPDATE',
      resourceType: 'team_member',
      resourceId: req.params.memberId,
      newValues: { status },
      ipAddress: req.ip,
    });

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/v1/users/:memberId
 * Remove a team member (does NOT delete from auth.users — use Supabase dashboard for that)
 */
router.delete('/:memberId', async (req: Request, res: Response) => {
  try {
    const actor = (req as any).user;

    const { data: existing } = await db
      .from('team_members')
      .select('*')
      .eq('id', req.params.memberId)
      .single();

    if (!existing) return res.status(404).json({ success: false, error: 'Member not found' });

    const { error } = await db
      .from('team_members')
      .delete()
      .eq('id', req.params.memberId);

    if (error) throw error;

    await logAudit({
      organizationId: existing.organization_id,
      userId: actor?.id,
      userEmail: actor?.email,
      action: 'DELETE',
      resourceType: 'team_member',
      resourceId: req.params.memberId,
      oldValues: existing,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Member removed' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
