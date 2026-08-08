import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query, run, logAudit } from '../db';
import { authenticateToken, requireRole, AuthRequest } from '../middleware';

const router = Router();

// Dashboard Statistics (Admin & Staff)
router.get('/stats', authenticateToken, requireRole('admin', 'staff'), async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const currentYearMonth = today.substring(0, 7);

    // Total Customers
    const custRes = await query(`SELECT COUNT(*) as count FROM users WHERE role = 'customer'`);
    const totalCustomers = custRes[0]?.count || 0;

    // Applications counts
    const todayAppRes = await query(`SELECT COUNT(*) as count FROM applications WHERE created_at LIKE ?`, [`${today}%`]);
    const todaysApplications = todayAppRes[0]?.count || 0;

    const pendingAppRes = await query(`SELECT COUNT(*) as count FROM applications WHERE status IN ('Submitted', 'Documents Required', 'Under Review', 'Processing', 'Pending')`);
    const pendingApplications = pendingAppRes[0]?.count || 0;

    const completedAppRes = await query(`SELECT COUNT(*) as count FROM applications WHERE status = 'Completed'`);
    const completedApplications = completedAppRes[0]?.count || 0;

    // Collections
    const todayCollRes = await query(`SELECT SUM(paid_amount) as total FROM payments WHERE payment_date LIKE ?`, [`${today}%`]);
    const todaysCollection = todayCollRes[0]?.total || 0;

    const monthlyCollRes = await query(`SELECT SUM(paid_amount) as total FROM payments WHERE payment_date LIKE ?`, [`${currentYearMonth}%`]);
    const monthlyCollection = monthlyCollRes[0]?.total || 0;

    // Total Pending Amount
    const pendingAmtRes = await query(`SELECT SUM(pending_amount) as total FROM applications WHERE pending_amount > 0`);
    const totalPendingAmount = pendingAmtRes[0]?.total || 0;

    // Monthly Expenses
    const monthlyExpRes = await query(`SELECT SUM(amount) as total FROM expenses WHERE date LIKE ?`, [`${currentYearMonth}%`]);
    const monthlyExpenses = monthlyExpRes[0]?.total || 0;

    // Net Income = Monthly Collection - Monthly Expenses
    const netIncome = monthlyCollection - monthlyExpenses;

    // Chart: Service stats
    const serviceStats = await query(
      `SELECT service_name, COUNT(*) as count FROM applications GROUP BY service_name ORDER BY count DESC LIMIT 8`
    );

    // Chart: Category stats
    const categoryStats = await query(
      `SELECT category, COUNT(*) as count FROM applications GROUP BY category`
    );

    // Chart: Daily Revenue (Last 7 days)
    const dailyRevenue: { date: string; amount: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const revRes = await query(`SELECT SUM(paid_amount) as total FROM payments WHERE payment_date LIKE ?`, [`${dStr}%`]);
      dailyRevenue.push({
        date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
        amount: revRes[0]?.total || 0
      });
    }

    // Chart: Monthly Revenue (Last 6 months)
    const monthlyRevenue: { month: string; amount: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const ymStr = d.toISOString().substring(0, 7);
      const mLabel = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const revRes = await query(`SELECT SUM(paid_amount) as total FROM payments WHERE payment_date LIKE ?`, [`${ymStr}%`]);
      monthlyRevenue.push({
        month: mLabel,
        amount: revRes[0]?.total || 0
      });
    }

    res.json({
      total_customers: totalCustomers,
      todays_applications: todaysApplications,
      pending_applications: pendingApplications,
      completed_applications: completedApplications,
      todays_collection: todaysCollection,
      monthly_collection: monthlyCollection,
      pending_amount: totalPendingAmount,
      monthly_expenses: monthlyExpenses,
      net_income: netIncome,
      daily_revenue: dailyRevenue,
      monthly_revenue: monthlyRevenue,
      service_stats: serviceStats,
      category_stats: categoryStats
    });
  } catch (err: any) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to generate statistics.' });
  }
});

// Users List (Customers & Staff)
router.get('/users', authenticateToken, requireRole('admin', 'staff'), async (req: AuthRequest, res: Response) => {
  try {
    const { role, search } = req.query;
    let sql = 'SELECT id, name, email, mobile, role, address, is_active, created_at FROM users WHERE 1=1';
    const params: any[] = [];

    if (role && role !== 'ALL') {
      sql += ' AND role = ?';
      params.push(role);
    }

    if (search) {
      sql += ' AND (name LIKE ? OR email LIKE ? OR mobile LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY id DESC';

    const users = await query(sql, params);
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// Create User / Admin / Staff (Admin only)
router.post('/users', authenticateToken, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, mobile, password, role, address } = req.body;

    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ error: 'Name, email, mobile, and password are required.' });
    }

    const userRole = role && ['admin', 'staff', 'customer'].includes(role) ? role : 'staff';

    const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const createdAt = new Date().toISOString();

    const result = await run(
      `INSERT INTO users (name, email, mobile, password_hash, role, address, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
      [name, email, mobile, passwordHash, userRole, address || '', createdAt]
    );

    await logAudit(req.user!.name, req.user!.role, `${userRole.toUpperCase()} Account Created`, `Created user: ${email}`);

    res.json({ id: result.lastInsertRowid, message: `${userRole} user created successfully.` });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create user account.' });
  }
});

// Create Staff (Admin only)
router.post('/staff', authenticateToken, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, mobile, password, address } = req.body;

    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ error: 'Name, email, mobile, and password are required.' });
    }

    const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const createdAt = new Date().toISOString();

    const result = await run(
      `INSERT INTO users (name, email, mobile, password_hash, role, address, is_active, created_at)
       VALUES (?, ?, ?, ?, 'staff', ?, 1, ?)`,
      [name, email, mobile, passwordHash, address || '', createdAt]
    );

    await logAudit(req.user!.name, req.user!.role, 'Staff Account Created', `Created staff: ${email}`);

    res.json({ id: result.lastInsertRowid, message: 'Staff user created successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create staff account.' });
  }
});

// Activate / Deactivate User or Staff Account (Admin only)
router.patch('/users/:id/status', authenticateToken, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const targetId = Number(req.params.id);
    if (targetId === req.user!.id) {
      return res.status(400).json({ error: 'You cannot deactivate your own logged-in admin account.' });
    }

    const { is_active } = req.body;
    const newStatus = is_active ? 1 : 0;

    await run('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, targetId]);
    await logAudit(
      req.user!.name,
      req.user!.role,
      `User ${newStatus === 1 ? 'Activated' : 'Deactivated'}`,
      `User ID ${targetId} set to ${newStatus === 1 ? 'Active' : 'Deactivated'}`
    );

    res.json({ message: `Account ${newStatus === 1 ? 'activated' : 'deactivated'} successfully.` });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update user active status.' });
  }
});

// Delete User or Staff Account (Admin only)
router.delete('/users/:id', authenticateToken, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const targetId = Number(req.params.id);
    if (targetId === req.user!.id) {
      return res.status(400).json({ error: 'You cannot delete your own logged-in admin account.' });
    }

    const existing = await query('SELECT * FROM users WHERE id = ?', [targetId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    await run('DELETE FROM users WHERE id = ?', [targetId]);
    await logAudit(req.user!.name, req.user!.role, 'User Account Deleted', `Deleted user ID ${targetId} (${existing[0].email})`);

    res.json({ message: 'User account deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete user account.' });
  }
});

// Update User / Reset Password (Admin only)
router.put('/users/:id', authenticateToken, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, mobile, address, role, new_password, is_active } = req.body;

    const activeStatus = is_active !== undefined ? (is_active ? 1 : 0) : 1;

    await run(
      `UPDATE users SET name = ?, email = ?, mobile = ?, address = ?, role = ?, is_active = ? WHERE id = ?`,
      [name, email, mobile, address || '', role, activeStatus, req.params.id]
    );

    if (new_password && new_password.trim().length > 0) {
      const hash = bcrypt.hashSync(new_password.trim(), 10);
      await run(`UPDATE users SET password_hash = ? WHERE id = ?`, [hash, req.params.id]);
    }

    await logAudit(req.user!.name, req.user!.role, 'User Account Updated', `Updated user ID: ${req.params.id}`);

    res.json({ message: 'User profile updated.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update user profile.' });
  }
});

// Get Settings (Public or Authenticated)
router.get('/settings', async (req: AuthRequest, res: Response) => {
  try {
    const settingsList = await query('SELECT key, value FROM settings');
    const settings: Record<string, string> = {};
    settingsList.forEach((s: any) => {
      settings[s.key] = s.value;
    });
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch settings.' });
  }
});

// Update Settings (Admin only)
router.post('/settings', authenticateToken, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const settings = req.body;
    for (const [key, value] of Object.entries(settings)) {
      await run(
        `INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
        [key, String(value)]
      );
    }

    await logAudit(req.user!.name, req.user!.role, 'Center Settings Updated', 'Updated center information');

    res.json({ message: 'Settings saved successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save settings.' });
  }
});

// Audit Logs (Admin only)
router.get(['/audit-logs', '/logs'], authenticateToken, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const logs = await query('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 100');
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch audit logs.' });
  }
});

// Reports (Admin & Staff)
router.get('/reports', authenticateToken, requireRole('admin', 'staff'), async (req: AuthRequest, res: Response) => {
  try {
    const { start_date, end_date } = req.query;
    const start = (start_date as string) || '1970-01-01';
    const end = (end_date as string) || '2099-12-31';

    const applications = await query(
      `SELECT * FROM applications WHERE created_at BETWEEN ? AND ? ORDER BY id DESC`,
      [`${start}T00:00:00`, `${end}T23:59:59`]
    );

    const payments = await query(
      `SELECT * FROM payments WHERE payment_date BETWEEN ? AND ? ORDER BY id DESC`,
      [`${start}T00:00:00`, `${end}T23:59:59`]
    );

    const expenses = await query(
      `SELECT * FROM expenses WHERE date BETWEEN ? AND ? ORDER BY id DESC`,
      [start, end]
    );

    const totalRevenue = payments.reduce((sum: number, p: any) => sum + Number(p.paid_amount || 0), 0);
    const totalExpense = expenses.reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0);

    res.json({
      start_date: start,
      end_date: end,
      total_revenue: totalRevenue,
      total_expense: totalExpense,
      net_profit: totalRevenue - totalExpense,
      applications_count: applications.length,
      applications,
      payments,
      expenses
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate report.' });
  }
});

// Notifications
router.get('/notifications', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    let sql = 'SELECT * FROM notifications WHERE user_id = ? OR user_id IS NULL ORDER BY id DESC LIMIT 20';
    const notifications = await query(sql, [user.id]);
    res.json(notifications);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
});

// FAQs (Public get / Admin manage)
router.get('/faqs', async (req: AuthRequest, res: Response) => {
  try {
    const faqs = await query('SELECT * FROM faqs ORDER BY id ASC');
    res.json(faqs);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch FAQs.' });
  }
});

router.post('/faqs', authenticateToken, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { category, question, answer } = req.body;
    await run(`INSERT INTO faqs (category, question, answer) VALUES (?, ?, ?)`, [category, question, answer]);
    res.json({ message: 'FAQ added.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to add FAQ.' });
  }
});

export default router;
