import { Router, Response } from 'express';
import { query, run, logAudit } from '../db';
import { authenticateToken, requireRole, AuthRequest } from '../middleware';

const router = Router();

// Get list of payments (Admin/Staff only)
router.get('/', authenticateToken, requireRole('admin', 'staff'), async (req: AuthRequest, res: Response) => {
  try {
    const { search, limit } = req.query;
    let sql = 'SELECT * FROM payments WHERE 1=1';
    const params: any[] = [];

    if (search) {
      sql += ' AND (application_no LIKE ? OR customer_name LIKE ? OR customer_mobile LIKE ? OR transaction_id LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    sql += ' ORDER BY id DESC';
    if (limit) sql += ' LIMIT ' + Number(limit);

    const payments = await query(sql, params);
    res.json(payments);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch payments.' });
  }
});

// Dedicated Pending Amount list for Admin & Staff
router.get('/pending', authenticateToken, requireRole('admin', 'staff'), async (req: AuthRequest, res: Response) => {
  try {
    const { search } = req.query;
    let sql = 'SELECT * FROM applications WHERE pending_amount > 0';
    const params: any[] = [];

    if (search) {
      sql += ' AND (application_no LIKE ? OR customer_name LIKE ? OR customer_mobile LIKE ? OR service_name LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    sql += ' ORDER BY pending_amount DESC';

    const pendingApps = await query(sql, params);
    res.json(pendingApps);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch pending amounts.' });
  }
});

// Record a payment / collect pending amount (Admin/Staff only)
router.post('/', authenticateToken, requireRole('admin', 'staff'), async (req: AuthRequest, res: Response) => {
  try {
    const { application_id, amount_paid, payment_method, transaction_id } = req.body;

    if (!application_id || !amount_paid || amount_paid <= 0) {
      return res.status(400).json({ error: 'Application ID and a valid payment amount are required.' });
    }

    const apps = await query('SELECT * FROM applications WHERE id = ?', [application_id]);
    if (apps.length === 0) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    const app = apps[0];
    const newPaidAmount = Number(app.paid_amount) + Number(amount_paid);
    const newPendingAmount = Math.max(0, Number(app.total_amount) - newPaidAmount);
    const now = new Date().toISOString();
    const txId = transaction_id || ('TXN' + Math.floor(10000000 + Math.random() * 90000000));
    const staffName = req.user!.name;

    // Update application pending & paid
    await run(
      `UPDATE applications SET paid_amount = ?, pending_amount = ?, updated_at = ? WHERE id = ?`,
      [newPaidAmount, newPendingAmount, now, application_id]
    );

    // Record payment entry
    const payResult = await run(
      `INSERT INTO payments
       (application_id, application_no, customer_name, customer_mobile, service_name, total_amount, paid_amount, pending_amount, payment_method, transaction_id, staff_id, staff_name, payment_status, payment_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        app.id,
        app.application_no,
        app.customer_name,
        app.customer_mobile,
        app.service_name,
        app.total_amount,
        amount_paid,
        newPendingAmount,
        payment_method || 'Cash',
        txId,
        req.user!.id,
        staffName,
        newPendingAmount === 0 ? 'Paid' : 'Partially Paid',
        now
      ]
    );

    // Send notification
    await run(
      `INSERT INTO notifications (user_id, title, message, is_read, link, created_at)
       VALUES (?, ?, ?, 0, ?, ?)`,
      [
        app.customer_id,
        'Payment Received',
        `Payment of ₹${amount_paid} received for ${app.application_no}. Remaining pending: ₹${newPendingAmount}.`,
        `/track?app_no=${app.application_no}&mobile=${app.customer_mobile}`,
        now
      ]
    );

    await logAudit(staffName, req.user!.role, 'Payment Collected', `Collected ₹${amount_paid} for ${app.application_no}. Txn: ${txId}`);

    res.json({
      success: true,
      payment_id: payResult.lastInsertRowid,
      transaction_id: txId,
      new_paid_amount: newPaidAmount,
      new_pending_amount: newPendingAmount,
      message: 'Payment recorded and pending balance updated successfully.'
    });
  } catch (err: any) {
    console.error('Payment record error:', err);
    res.status(500).json({ error: 'Failed to record payment.' });
  }
});

// Fetch detailed receipt data by Application ID or Number
router.get('/receipt/:app_no', async (req: AuthRequest, res: Response) => {
  try {
    const appNo = req.params.app_no;
    const apps = await query('SELECT * FROM applications WHERE UPPER(application_no) = UPPER(?)', [appNo]);
    if (apps.length === 0) {
      return res.status(404).json({ error: 'Receipt not found.' });
    }

    const app = apps[0];
    const payments = await query('SELECT * FROM payments WHERE application_id = ? ORDER BY id DESC', [app.id]);
    const settingsList = await query('SELECT key, value FROM settings');
    const settings: Record<string, string> = {};
    settingsList.forEach((s: any) => {
      settings[s.key] = s.value;
    });

    res.json({
      application: app,
      payments,
      center_info: settings
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch receipt data.' });
  }
});

export default router;
