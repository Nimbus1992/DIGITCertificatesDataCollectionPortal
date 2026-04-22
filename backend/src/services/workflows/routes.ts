import { Router, Request, Response } from 'express';
import { db } from '../../shared/db';
import { logAudit } from '../../shared/audit';
import { WorkflowStage, WorkflowAction, WorkflowCondition } from '../../shared/types';

const router = Router();

// Helper: evaluate a workflow condition against form data
function evaluateCondition(
  fieldValue: any,
  operator: string,
  conditionValue: string | number
): boolean {
  const val = fieldValue;
  const cval = conditionValue;

  switch (operator) {
    case 'eq':  return String(val) === String(cval);
    case 'neq': return String(val) !== String(cval);
    case 'gt':  return Number(val) > Number(cval);
    case 'lt':  return Number(val) < Number(cval);
    case 'gte': return Number(val) >= Number(cval);
    case 'lte': return Number(val) <= Number(cval);
    case 'contains': return String(val).toLowerCase().includes(String(cval).toLowerCase());
    default: return true;
  }
}

// Helper: get workflow definition for service
async function getWorkflowDefinition(serviceId: string): Promise<{ stages: WorkflowStage[] } | null> {
  const { data, error } = await db
    .from('service_configs')
    .select('config_data')
    .eq('service_id', serviceId)
    .eq('config_type', 'workflow_definition')
    .order('version', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data.config_data as { stages: WorkflowStage[] };
}

// GET /:serviceId - get workflow definition
router.get('/:serviceId', async (req: Request, res: Response) => {
  try {
    const { data, error } = await db
      .from('service_configs')
      .select('*')
      .eq('service_id', req.params.serviceId)
      .eq('config_type', 'workflow_definition')
      .order('version', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (!data) {
      return res.json({
        success: true,
        data: {
          service_id: req.params.serviceId,
          config_type: 'workflow_definition',
          config_data: { stages: [] },
          version: 1
        }
      });
    }

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /:serviceId - save workflow definition
router.put('/:serviceId', async (req: Request, res: Response) => {
  try {
    const { stages } = req.body;
    const user = (req as any).user;

    if (!stages || !Array.isArray(stages)) {
      return res.status(400).json({ success: false, error: 'stages array is required' });
    }

    const { data: existing } = await db
      .from('service_configs')
      .select('id, version')
      .eq('service_id', req.params.serviceId)
      .eq('config_type', 'workflow_definition')
      .limit(1)
      .single();

    const configData = { stages };
    const newVersion = existing ? ((existing.version || 1) + 1) : 1;

    let data: any;
    let error: any;

    if (existing) {
      ({ data, error } = await db
        .from('service_configs')
        .update({
          config_data: configData,
          version: newVersion,
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
          config_type: 'workflow_definition',
          config_data: configData,
          version: newVersion,
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
      resourceType: 'workflow_definition',
      resourceId: req.params.serviceId,
      newValues: configData,
      ipAddress: req.ip
    });

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /:serviceId/stages - list stages for UI dropdowns
router.get('/:serviceId/stages', async (req: Request, res: Response) => {
  try {
    const workflow = await getWorkflowDefinition(req.params.serviceId);
    if (!workflow) return res.json({ success: true, data: [] });

    const stages = (workflow.stages || []).map((s: WorkflowStage) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      is_initial: s.is_initial,
      is_terminal: s.is_terminal,
      allowed_roles: s.allowed_roles
    }));

    res.json({ success: true, data: stages });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /instance/:applicationId/available-actions - get available actions for current user
router.post('/instance/:applicationId/available-actions', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const { data: application, error: appError } = await db
      .from('applications')
      .select('*')
      .eq('id', req.params.applicationId)
      .single();

    if (appError || !application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    const workflow = await getWorkflowDefinition(application.service_id);
    if (!workflow) return res.json({ success: true, data: [] });

    const currentStage = workflow.stages.find((s: WorkflowStage) => s.id === application.current_stage);
    if (!currentStage) return res.json({ success: true, data: [] });

    // Filter actions based on user role and conditions
    const availableActions = (currentStage.actions || []).filter((action: WorkflowAction) => {
      // Check conditions
      if (action.conditions && action.conditions.length > 0) {
        for (const cond of action.conditions) {
          const fieldValue = application.form_data?.[cond.field];
          if (!evaluateCondition(fieldValue, cond.operator, cond.value)) return false;
        }
      }
      return true;
    });

    res.json({
      success: true,
      data: {
        currentStage: currentStage.name,
        actions: availableActions
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /instance/:applicationId/advance - advance workflow
router.post('/instance/:applicationId/advance', async (req: Request, res: Response) => {
  try {
    const { actionId, comments, checklistResponse } = req.body;
    const user = (req as any).user;

    if (!actionId) return res.status(400).json({ success: false, error: 'actionId is required' });

    // Get application
    const { data: application, error: appError } = await db
      .from('applications')
      .select('*')
      .eq('id', req.params.applicationId)
      .single();

    if (appError || !application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    // Get workflow
    const workflow = await getWorkflowDefinition(application.service_id);
    if (!workflow) return res.status(400).json({ success: false, error: 'No workflow defined for this service' });

    // Find current stage
    const currentStage = workflow.stages.find((s: WorkflowStage) => s.id === application.current_stage);
    if (!currentStage) return res.status(400).json({ success: false, error: 'Current stage not found in workflow' });

    // Find action
    const action = currentStage.actions.find((a: WorkflowAction) => a.id === actionId);
    if (!action) return res.status(400).json({ success: false, error: 'Action not found in current stage' });

    // Check requires_comment
    if (action.requires_comment && !comments) {
      return res.status(400).json({ success: false, error: 'Comment is required for this action' });
    }

    // Evaluate conditions
    if (action.conditions && action.conditions.length > 0) {
      for (const cond of action.conditions) {
        const fieldValue = application.form_data?.[cond.field];
        if (!evaluateCondition(fieldValue, cond.operator, cond.value)) {
          return res.status(400).json({ success: false, error: 'Action conditions not met' });
        }
      }
    }

    // Find next stage
    const nextStage = workflow.stages.find((s: WorkflowStage) => s.id === action.to_stage);
    if (!nextStage) return res.status(400).json({ success: false, error: `Next stage '${action.to_stage}' not found` });

    // Determine new application status from stage name or terminal flag
    let newStatus = application.status;
    if (nextStage.is_terminal) {
      const stageLower = nextStage.name.toLowerCase();
      if (stageLower.includes('approv')) newStatus = 'approved';
      else if (stageLower.includes('reject')) newStatus = 'rejected';
      else if (stageLower.includes('cancel')) newStatus = 'cancelled';
    } else {
      const stageLower = nextStage.name.toLowerCase();
      if (stageLower.includes('review')) newStatus = 'in_review';
      else if (stageLower.includes('query')) newStatus = 'query_raised';
    }

    // Update application
    const { data: updatedApp, error: updateError } = await db
      .from('applications')
      .update({
        current_stage: nextStage.id,
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.applicationId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Insert timeline entry
    await db.from('application_timeline').insert({
      application_id: req.params.applicationId,
      from_stage: currentStage.id,
      from_stage_name: currentStage.name,
      to_stage: nextStage.id,
      to_stage_name: nextStage.name,
      action_id: actionId,
      action_label: action.label,
      performed_by: user?.id,
      performed_by_email: user?.email,
      comments,
      checklist_response: checklistResponse || null,
      created_at: new Date().toISOString()
    });

    // Trigger system actions for next stage on_enter
    const systemActions = nextStage.system_actions || [];
    for (const sa of systemActions) {
      if (sa.trigger === 'on_enter') {
        if (sa.type === 'notify') {
          // Trigger notification asynchronously
          try {
            const { sendStageNotification } = await import('../notifications/routes');
            await sendStageNotification(req.params.applicationId, nextStage.name, sa.config);
          } catch (e) {
            console.error('System notification failed:', e);
          }
        }
      }
    }

    await logAudit({
      organizationId: application.organization_id,
      userId: user?.id,
      userEmail: user?.email,
      action: 'WORKFLOW_ADVANCE',
      resourceType: 'application',
      resourceId: req.params.applicationId,
      oldValues: { stage: currentStage.id, status: application.status },
      newValues: { stage: nextStage.id, status: newStatus },
      ipAddress: req.ip
    });

    res.json({
      success: true,
      data: {
        application: updatedApp,
        transition: {
          from: currentStage.name,
          to: nextStage.name,
          action: action.label
        }
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /instance/:applicationId/query - raise query
router.post('/instance/:applicationId/query', async (req: Request, res: Response) => {
  try {
    const { queryText } = req.body;
    const user = (req as any).user;

    if (!queryText) return res.status(400).json({ success: false, error: 'queryText is required' });

    // Update application status to query_raised
    const { data: application, error: appError } = await db
      .from('applications')
      .update({ status: 'query_raised', updated_at: new Date().toISOString() })
      .eq('id', req.params.applicationId)
      .select()
      .single();

    if (appError) throw appError;

    // Insert query record
    const { data: query, error: queryError } = await db
      .from('application_queries')
      .insert({
        application_id: req.params.applicationId,
        query_text: queryText,
        raised_by: user?.id,
        raised_by_email: user?.email,
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (queryError) throw queryError;

    // Timeline entry
    await db.from('application_timeline').insert({
      application_id: req.params.applicationId,
      action_label: 'Query Raised',
      performed_by: user?.id,
      performed_by_email: user?.email,
      comments: queryText,
      created_at: new Date().toISOString()
    });

    res.json({ success: true, data: query });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /instance/:applicationId/respond - respond to query
router.post('/instance/:applicationId/respond', async (req: Request, res: Response) => {
  try {
    const { queryId, responseText } = req.body;
    const user = (req as any).user;

    if (!queryId || !responseText) {
      return res.status(400).json({ success: false, error: 'queryId and responseText are required' });
    }

    const { data: query, error: queryError } = await db
      .from('application_queries')
      .update({
        response_text: responseText,
        responded_by: user?.id,
        responded_by_email: user?.email,
        responded_at: new Date().toISOString(),
        status: 'resolved',
        updated_at: new Date().toISOString()
      })
      .eq('id', queryId)
      .eq('application_id', req.params.applicationId)
      .select()
      .single();

    if (queryError) throw queryError;

    // Check if all queries are resolved, if so revert to in_review
    const { data: openQueries } = await db
      .from('application_queries')
      .select('id')
      .eq('application_id', req.params.applicationId)
      .eq('status', 'open');

    if (!openQueries || openQueries.length === 0) {
      await db
        .from('applications')
        .update({ status: 'in_review', updated_at: new Date().toISOString() })
        .eq('id', req.params.applicationId);
    }

    // Timeline entry
    await db.from('application_timeline').insert({
      application_id: req.params.applicationId,
      action_label: 'Query Response Submitted',
      performed_by: user?.id,
      performed_by_email: user?.email,
      comments: responseText,
      created_at: new Date().toISOString()
    });

    res.json({ success: true, data: query });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /instance/:applicationId/timeline - full timeline
router.get('/instance/:applicationId/timeline', async (req: Request, res: Response) => {
  try {
    const { data: timeline, error: timelineError } = await db
      .from('application_timeline')
      .select('*')
      .eq('application_id', req.params.applicationId)
      .order('created_at', { ascending: true });

    if (timelineError) throw timelineError;

    const { data: queries, error: queriesError } = await db
      .from('application_queries')
      .select('*')
      .eq('application_id', req.params.applicationId)
      .order('created_at', { ascending: true });

    if (queriesError) throw queriesError;

    res.json({
      success: true,
      data: {
        timeline: timeline || [],
        queries: queries || []
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
