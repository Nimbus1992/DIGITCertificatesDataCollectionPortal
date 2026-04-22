import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import PDFDocument from 'pdfkit';
import { db } from '../../shared/db';
import { logAudit } from '../../shared/audit';
import { FeeRule } from '../../shared/types';

const router = Router();

function getStripe(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' });
}

// Helper: evaluate a fee condition
function evaluateCondition(fieldValue: any, operator: string, conditionValue: string): boolean {
  switch (operator) {
    case 'eq':  return String(fieldValue) === String(conditionValue);
    case 'neq': return String(fieldValue) !== String(conditionValue);
    case 'gt':  return Number(fieldValue) > Number(conditionValue);
    case 'lt':  return Number(fieldValue) < Number(conditionValue);
    case 'gte': return Number(fieldValue) >= Number(conditionValue);
    case 'lte': return Number(fieldValue) <= Number(conditionValue);
    case 'contains': return String(fieldValue).toLowerCase().includes(String(conditionValue).toLowerCase());
    default: return true;
  }
}

// Helper: calculate fees
function calculateFees(
  rules: FeeRule[],
  formData: Record<string, any>
): { total: number; breakdown: { ruleName: string; amount: number; type: string }[] } {
  const breakdown: { ruleName: string; amount: number; type: string }[] = [];

  for (const rule of rules) {
    if (!rule.is_active) continue;

    if (rule.condition_field && rule.condition_operator && rule.condition_value !== undefined) {
      const fieldValue = formData[rule.condition_field];
      if (!evaluateCondition(fieldValue, rule.condition_operator, rule.condition_value)) continue;
    }

    breakdown.push({ ruleName: rule.name, amount: rule.fee_amount, type: rule.fee_type });
  }

  const total = breakdown.reduce((sum, item) => sum + item.amount, 0);
  return { total, breakdown };
}

// POST /calculate - calculate fees for an application
router.post('/calculate', async (req: Request, res: Response) => {
  try {
    const { serviceId, formData } = req.body;
    if (!serviceId || !formData) {
      return res.status(400).json({ success: false, error: 'serviceId and formData are required' });
    }

    const { data: rules, error } = await db
      .from('service_fee_rules')
      .select('*')
      .eq('service_id', serviceId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    const result = calculateFees(rules || [], formData);

    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /initiate-online - create Stripe payment intent
router.post('/initiate-online', async (req: Request, res: Response) => {
  try {
    const { applicationId, amount, currency = 'usd' } = req.body;
    const user = (req as any).user;

    if (!applicationId || !amount) {
      return res.status(400).json({ success: false, error: 'applicationId and amount are required' });
    }

    const { data: application } = await db
      .from('applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (!application) return res.status(404).json({ success: false, error: 'Application not found' });

    let clientSecret: string | null = null;
    let stripePaymentIntentId: string | null = null;

    // Try Stripe
    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'your_stripe_secret_key') {
      try {
        const stripe = getStripe();
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency,
          metadata: {
            applicationId,
            referenceNumber: application.reference_number
          }
        });
        clientSecret = paymentIntent.client_secret;
        stripePaymentIntentId = paymentIntent.id;
      } catch (stripeErr: any) {
        console.error('Stripe error:', stripeErr.message);
        // Fall through with simulated intent
      }
    }

    // If Stripe not configured, simulate
    if (!clientSecret) {
      stripePaymentIntentId = `pi_simulated_${Date.now()}`;
      clientSecret = `pi_simulated_secret_${Date.now()}`;
    }

    // Store transaction
    const { data: transaction, error: txError } = await db
      .from('payment_transactions')
      .insert({
        application_id: applicationId,
        organization_id: application.organization_id,
        amount,
        currency,
        payment_method: 'online_card',
        payment_gateway: 'stripe',
        gateway_transaction_id: stripePaymentIntentId,
        status: 'pending',
        recorded_by: user?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (txError) throw txError;

    await logAudit({
      organizationId: application.organization_id,
      userId: user?.id,
      userEmail: user?.email,
      action: 'INITIATE_PAYMENT',
      resourceType: 'payment_transaction',
      resourceId: transaction.id,
      newValues: { amount, currency, applicationId },
      ipAddress: req.ip
    });

    res.json({
      success: true,
      data: {
        transactionId: transaction.id,
        clientSecret,
        stripePaymentIntentId,
        amount,
        currency
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /record-offline - record offline payment
router.post('/record-offline', async (req: Request, res: Response) => {
  try {
    const { applicationId, amount, method, paymentDate, receiptNumber, notes } = req.body;
    const user = (req as any).user;

    if (!applicationId || !amount || !method) {
      return res.status(400).json({ success: false, error: 'applicationId, amount, and method are required' });
    }

    const validMethods = ['offline_cash', 'offline_check', 'offline_bank'];
    if (!validMethods.includes(method)) {
      return res.status(400).json({ success: false, error: `method must be one of: ${validMethods.join(', ')}` });
    }

    const { data: application } = await db
      .from('applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (!application) return res.status(404).json({ success: false, error: 'Application not found' });

    const { data: transaction, error: txError } = await db
      .from('payment_transactions')
      .insert({
        application_id: applicationId,
        organization_id: application.organization_id,
        amount,
        currency: 'usd',
        payment_method: method,
        status: 'completed',
        payment_date: paymentDate || new Date().toISOString(),
        receipt_number: receiptNumber || `REC-${Date.now()}`,
        recorded_by: user?.id,
        notes: notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (txError) throw txError;

    await logAudit({
      organizationId: application.organization_id,
      userId: user?.id,
      userEmail: user?.email,
      action: 'RECORD_OFFLINE_PAYMENT',
      resourceType: 'payment_transaction',
      resourceId: transaction.id,
      newValues: { amount, method, receiptNumber },
      ipAddress: req.ip
    });

    res.status(201).json({ success: true, data: transaction });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /:applicationId - get payment status
router.get('/:applicationId', async (req: Request, res: Response) => {
  try {
    const { data, error } = await db
      .from('payment_transactions')
      .select('*')
      .eq('application_id', req.params.applicationId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const transactions = data || [];
    const latestCompleted = transactions.find(t => t.status === 'completed');
    const total = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

    res.json({
      success: true,
      data: {
        transactions,
        isPaid: !!latestCompleted,
        totalPaid: total,
        latestTransaction: transactions[0] || null
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /webhook/stripe - Stripe webhook
router.post('/webhook/stripe', async (req: Request, res: Response) => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    if (webhookSecret && process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'your_stripe_secret_key') {
      try {
        const stripe = getStripe();
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } catch (err: any) {
        return res.status(400).json({ success: false, error: `Webhook signature verification failed: ${err.message}` });
      }
    } else {
      // In development, parse body directly
      event = req.body as Stripe.Event;
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await db
          .from('payment_transactions')
          .update({
            status: 'completed',
            payment_date: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('gateway_transaction_id', paymentIntent.id);
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await db
          .from('payment_transactions')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('gateway_transaction_id', paymentIntent.id);
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await db
          .from('payment_transactions')
          .update({
            status: 'refunded',
            updated_at: new Date().toISOString()
          })
          .eq('gateway_transaction_id', charge.payment_intent as string);
        break;
      }
      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /receipt/:transactionId - generate payment receipt PDF
router.get('/receipt/:transactionId', async (req: Request, res: Response) => {
  try {
    const { data: transaction, error } = await db
      .from('payment_transactions')
      .select('*')
      .eq('id', req.params.transactionId)
      .single();

    if (error || !transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    const { data: application } = await db
      .from('applications')
      .select('*, services(name), organizations(name)')
      .eq('id', transaction.application_id)
      .single();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="receipt-${req.params.transactionId}.pdf"`);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    const orgName = (application as any)?.organizations?.name || 'Organization';
    const serviceName = (application as any)?.services?.name || 'Service';

    // Header
    doc.fontSize(22).font('Helvetica-Bold').text(orgName, { align: 'center' });
    doc.fontSize(14).font('Helvetica').text('Official Payment Receipt', { align: 'center' });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(560, doc.y).stroke();
    doc.moveDown();

    // Receipt details
    doc.fontSize(12).font('Helvetica-Bold').text('Receipt Details', { underline: true });
    doc.moveDown(0.5);

    const details = [
      ['Receipt Number:', transaction.receipt_number || req.params.transactionId],
      ['Transaction ID:', transaction.id],
      ['Application Reference:', application?.reference_number || 'N/A'],
      ['Service:', serviceName],
      ['Applicant:', application?.applicant_name || 'N/A'],
      ['Payment Method:', transaction.payment_method.replace(/_/g, ' ').toUpperCase()],
      ['Amount Paid:', `$${Number(transaction.amount).toFixed(2)} ${(transaction.currency || 'usd').toUpperCase()}`],
      ['Payment Date:', transaction.payment_date ? new Date(transaction.payment_date).toLocaleDateString() : new Date(transaction.created_at).toLocaleDateString()],
      ['Status:', transaction.status.toUpperCase()]
    ];

    for (const [label, value] of details) {
      doc.font('Helvetica-Bold').text(label, { continued: true, width: 200 });
      doc.font('Helvetica').text(` ${value}`);
    }

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(560, doc.y).stroke();
    doc.moveDown();

    if (transaction.notes) {
      doc.fontSize(10).font('Helvetica-Oblique').text(`Notes: ${transaction.notes}`);
      doc.moveDown();
    }

    doc.fontSize(10).font('Helvetica').text(
      'This is an official receipt. Please retain for your records.',
      { align: 'center', oblique: true }
    );
    doc.fontSize(8).text(`Generated on ${new Date().toLocaleString()}`, { align: 'center' });

    doc.end();
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Fee Rules CRUD ---

// GET /rules/:serviceId - get fee rules for service
router.get('/rules/:serviceId', async (req: Request, res: Response) => {
  try {
    const { data, error } = await db
      .from('service_fee_rules')
      .select('*')
      .eq('service_id', req.params.serviceId)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /rules/:serviceId - create fee rule
router.post('/rules/:serviceId', async (req: Request, res: Response) => {
  try {
    const {
      name,
      condition_field,
      condition_operator,
      condition_value,
      fee_amount,
      fee_type = 'fixed',
      description,
      is_active = true,
      sort_order = 0
    } = req.body;
    const user = (req as any).user;

    if (!name || fee_amount === undefined) {
      return res.status(400).json({ success: false, error: 'name and fee_amount are required' });
    }

    const { data, error } = await db
      .from('service_fee_rules')
      .insert({
        service_id: req.params.serviceId,
        name,
        condition_field,
        condition_operator,
        condition_value,
        fee_amount,
        fee_type,
        description,
        is_active,
        sort_order,
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
      resourceType: 'fee_rule',
      resourceId: data.id,
      newValues: data,
      ipAddress: req.ip
    });

    res.status(201).json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /rules/:serviceId/:ruleId - update fee rule
router.put('/rules/:serviceId/:ruleId', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const allowedFields = [
      'name', 'condition_field', 'condition_operator', 'condition_value',
      'fee_amount', 'fee_type', 'description', 'is_active', 'sort_order'
    ];

    const updatePayload: Record<string, any> = { updated_at: new Date().toISOString() };
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updatePayload[field] = req.body[field];
    }

    const { data, error } = await db
      .from('service_fee_rules')
      .update(updatePayload)
      .eq('id', req.params.ruleId)
      .eq('service_id', req.params.serviceId)
      .select()
      .single();

    if (error) throw error;

    await logAudit({
      userId: user?.id,
      userEmail: user?.email,
      action: 'UPDATE',
      resourceType: 'fee_rule',
      resourceId: req.params.ruleId,
      newValues: updatePayload,
      ipAddress: req.ip
    });

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /rules/:serviceId/:ruleId - delete fee rule
router.delete('/rules/:serviceId/:ruleId', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const { error } = await db
      .from('service_fee_rules')
      .delete()
      .eq('id', req.params.ruleId)
      .eq('service_id', req.params.serviceId);

    if (error) throw error;

    await logAudit({
      userId: user?.id,
      userEmail: user?.email,
      action: 'DELETE',
      resourceType: 'fee_rule',
      resourceId: req.params.ruleId,
      ipAddress: req.ip
    });

    res.json({ success: true, message: 'Fee rule deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
