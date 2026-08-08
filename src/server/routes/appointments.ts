import { Router, Response } from 'express';
import { query, run, logAudit } from '../db';
import { authenticateToken, requireRole, AuthRequest } from '../middleware';

const router = Router();

// List appointments
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    let sql = 'SELECT * FROM appointments WHERE 1=1';
    const params: any[] = [];

    if (user.role === 'customer') {
      sql += ' AND (customer_id = ? OR customer_mobile = ?)';
      params.push(user.id, user.mobile);
    }

    sql += ' ORDER BY date ASC, time ASC';

    const appointments = await query(sql, params);
    res.json(appointments);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch appointments.' });
  }
});

// Book appointment
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { customer_name, customer_mobile, service_id, service_name, date, time, message } = req.body;

    if (!customer_name || !customer_mobile || !date || !time) {
      return res.status(400).json({ error: 'Customer Name, Mobile, Date, and Time are required.' });
    }

    // Double-booking prevention check
    const existing = await query(
      `SELECT id FROM appointments WHERE date = ? AND time = ? AND status IN ('Approved', 'Requested')`,
      [date, time]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: `The time slot ${time} on ${date} is already reserved. Please select another time slot.` });
    }

    const now = new Date().toISOString();
    const custId = req.user?.id || null;

    const result = await run(
      `INSERT INTO appointments (customer_id, customer_name, customer_mobile, service_id, service_name, date, time, message, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Requested', ?)`,
      [
        custId,
        customer_name,
        customer_mobile,
        service_id || null,
        service_name || 'General Consultation',
        date,
        time,
        message || '',
        now
      ]
    );

    // Notify user if authenticated
    if (custId) {
      await run(
        `INSERT INTO notifications (user_id, title, message, is_read, link, created_at)
         VALUES (?, ?, ?, 0, ?, ?)`,
        [
          custId,
          'Appointment Requested',
          `Appointment request for ${date} at ${time} received. Awaiting center confirmation.`,
          '/appointments',
          now
        ]
      );
    }

    await logAudit(customer_name, req.user?.role || 'customer', 'Appointment Booked', `Slot ${date} ${time}`);

    res.json({ id: result.lastInsertRowid, message: 'Appointment booked successfully. We will confirm your slot shortly!' });
  } catch (err: any) {
    console.error('Book appointment error:', err);
    res.status(500).json({ error: 'Failed to book appointment.' });
  }
});

// Update appointment status (Admin/Staff only)
router.put('/:id/status', authenticateToken, requireRole('admin', 'staff'), async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required.' });
    }

    const appts = await query('SELECT * FROM appointments WHERE id = ?', [req.params.id]);
    if (appts.length === 0) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    const appt = appts[0];
    await run('UPDATE appointments SET status = ? WHERE id = ?', [status, req.params.id]);

    if (appt.customer_id) {
      const now = new Date().toISOString();
      await run(
        `INSERT INTO notifications (user_id, title, message, is_read, link, created_at)
         VALUES (?, ?, ?, 0, ?, ?)`,
        [
          appt.customer_id,
          `Appointment ${status}`,
          `Your appointment for ${appt.service_name} on ${appt.date} at ${appt.time} has been ${status.toLowerCase()}.`,
          '/appointments',
          now
        ]
      );
    }

    await logAudit(req.user!.name, req.user!.role, 'Appointment Status Changed', `Appointment ID ${req.params.id} -> ${status}`);

    res.json({ message: 'Appointment status updated.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update appointment status.' });
  }
});

export default router;
