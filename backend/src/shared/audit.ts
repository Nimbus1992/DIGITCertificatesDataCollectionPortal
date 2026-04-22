import { db } from './db';

export async function logAudit(params: {
  organizationId?: string;
  userId?: string;
  userEmail?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
}) {
  try {
    await db.from('audit_logs').insert({
      organization_id: params.organizationId,
      user_id: params.userId,
      user_email: params.userEmail,
      action: params.action,
      resource_type: params.resourceType,
      resource_id: params.resourceId,
      old_values: params.oldValues,
      new_values: params.newValues,
      ip_address: params.ipAddress,
      created_at: new Date().toISOString()
    });
  } catch (e) {
    console.error('Audit log failed:', e);
  }
}
