import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query, run, logAudit, logDiffAudit } from '../db';
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

// ==========================================
// PHASE 2: Extended Customer Profile & Duplicate Detection
// ==========================================

// Check duplicates by Mobile, Aadhaar, PAN
router.post('/customers/check-duplicate', authenticateToken, requireRole('admin', 'staff'), async (req: AuthRequest, res: Response) => {
  try {
    const { mobile, aadhaar_no, pan_no, exclude_customer_id } = req.body;
    const matches: any[] = [];

    // Check Mobile
    if (mobile && String(mobile).trim().length >= 5) {
      const cleanMobile = String(mobile).trim();
      let sql = `SELECT id, name, mobile, role, aadhaar_no, pan_no FROM users WHERE mobile = ?`;
      const params: any[] = [cleanMobile];
      if (exclude_customer_id) {
        sql += ` AND id != ?`;
        params.push(exclude_customer_id);
      }
      const mobileUsers = await query(sql, params);
      for (const u of mobileUsers) {
        const appCount = await query(`SELECT COUNT(*) as count FROM applications WHERE customer_id = ? OR customer_mobile = ?`, [u.id, cleanMobile]);
        matches.push({
          matched_field: 'mobile',
          matched_value: cleanMobile,
          customer_id: u.id,
          customer_name: u.name,
          customer_mobile: u.mobile,
          existing_applications_count: appCount[0]?.count || 0
        });
      }
    }

    // Check Aadhaar
    if (aadhaar_no && String(aadhaar_no).trim().length >= 8) {
      const cleanAadhaar = String(aadhaar_no).trim();
      let sql = `SELECT id, name, mobile, aadhaar_no FROM users WHERE aadhaar_no = ?`;
      const params: any[] = [cleanAadhaar];
      if (exclude_customer_id) {
        sql += ` AND id != ?`;
        params.push(exclude_customer_id);
      }
      const aadhaarUsers = await query(sql, params);
      for (const u of aadhaarUsers) {
        if (!matches.some(m => m.customer_id === u.id && m.matched_field === 'aadhaar')) {
          matches.push({
            matched_field: 'aadhaar',
            matched_value: cleanAadhaar,
            customer_id: u.id,
            customer_name: u.name,
            customer_mobile: u.mobile
          });
        }
      }
    }

    // Check PAN
    if (pan_no && String(pan_no).trim().length >= 5) {
      const cleanPan = String(pan_no).trim().toUpperCase();
      let sql = `SELECT id, name, mobile, pan_no FROM users WHERE UPPER(pan_no) = ?`;
      const params: any[] = [cleanPan];
      if (exclude_customer_id) {
        sql += ` AND id != ?`;
        params.push(exclude_customer_id);
      }
      const panUsers = await query(sql, params);
      for (const u of panUsers) {
        if (!matches.some(m => m.customer_id === u.id && m.matched_field === 'pan')) {
          matches.push({
            matched_field: 'pan',
            matched_value: cleanPan,
            customer_id: u.id,
            customer_name: u.name,
            customer_mobile: u.mobile
          });
        }
      }
    }

    res.json({
      has_duplicates: matches.length > 0,
      matches
    });
  } catch (err: any) {
    console.error('Duplicate check error:', err);
    res.status(500).json({ error: 'Failed to check duplicate customer records.' });
  }
});

// Fetch extended customer profiles
router.get('/customers', authenticateToken, requireRole('admin', 'staff'), async (req: AuthRequest, res: Response) => {
  try {
    const { search } = req.query;
    let sql = `SELECT id, name, email, mobile, role, address, is_active, created_at,
                      aadhaar_no, pan_no, voter_id, ration_card, dob, emergency_contact,
                      advance_balance, pending_dues
               FROM users WHERE role = 'customer'`;
    const params: any[] = [];

    if (search) {
      sql += ` AND (name LIKE ? OR mobile LIKE ? OR email LIKE ? OR aadhaar_no LIKE ? OR pan_no LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term, term);
    }

    sql += ` ORDER BY id DESC`;
    const customers = await query(sql, params);
    res.json(customers);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch customer profiles.' });
  }
});

// Add / Update Extended Customer Profile
router.post('/customers', authenticateToken, requireRole('admin', 'staff'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, mobile, password, address, aadhaar_no, pan_no, voter_id, ration_card, dob, emergency_contact, advance_balance } = req.body;

    if (!name || !mobile) {
      return res.status(400).json({ error: 'Customer Name and Mobile Number are required.' });
    }

    // Check mobile duplicate
    const existing = await query(`SELECT id FROM users WHERE mobile = ?`, [mobile]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'A user with this mobile number already exists.' });
    }

    const passHash = bcrypt.hashSync(password || 'cust1234', 10);
    const now = new Date().toISOString();
    const custEmail = email || `cust_${Date.now()}@csc.local`;

    const result = await run(
      `INSERT INTO users (name, email, mobile, password_hash, role, address, aadhaar_no, pan_no, voter_id, ration_card, dob, emergency_contact, advance_balance, is_active, created_at)
       VALUES (?, ?, ?, ?, 'customer', ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      [name, custEmail, mobile, passHash, address || '', aadhaar_no || '', pan_no || '', voter_id || '', ration_card || '', dob || '', emergency_contact || '', Number(advance_balance || 0), now]
    );

    await logDiffAudit('CUSTOMER', result.lastInsertRowid, name, 'ACCOUNT_CREATED', '', 'Customer Profile Created', req.user!.name, req.user!.role, 'CREATE');

    res.json({ message: 'Customer created successfully.', customer_id: result.lastInsertRowid });
  } catch (err: any) {
    console.error('Customer create error:', err);
    res.status(500).json({ error: 'Failed to create customer profile.' });
  }
});

router.put('/customers/:id', authenticateToken, requireRole('admin', 'staff'), async (req: AuthRequest, res: Response) => {
  try {
    const custId = req.params.id;
    const { name, email, mobile, address, aadhaar_no, pan_no, voter_id, ration_card, dob, emergency_contact, advance_balance } = req.body;

    const oldCustRes = await query(`SELECT * FROM users WHERE id = ?`, [custId]);
    if (oldCustRes.length === 0) {
      return res.status(404).json({ error: 'Customer not found.' });
    }
    const oldCust = oldCustRes[0];

    // Log diffs
    const fieldsToTrack = [
      { key: 'name', val: name },
      { key: 'email', val: email },
      { key: 'mobile', val: mobile },
      { key: 'address', val: address },
      { key: 'aadhaar_no', val: aadhaar_no },
      { key: 'pan_no', val: pan_no },
      { key: 'voter_id', val: voter_id },
      { key: 'ration_card', val: ration_card },
      { key: 'dob', val: dob },
      { key: 'emergency_contact', val: emergency_contact },
      { key: 'advance_balance', val: advance_balance }
    ];

    for (const f of fieldsToTrack) {
      if (f.val !== undefined && String(oldCust[f.key] || '') !== String(f.val || '')) {
        await logDiffAudit('CUSTOMER', Number(custId), oldCust.name, f.key, oldCust[f.key] || '', f.val || '', req.user!.name, req.user!.role, 'UPDATE');
      }
    }

    await run(
      `UPDATE users SET name = ?, email = ?, mobile = ?, address = ?, aadhaar_no = ?, pan_no = ?, voter_id = ?, ration_card = ?, dob = ?, emergency_contact = ?, advance_balance = ?
       WHERE id = ?`,
      [name, email, mobile, address || '', aadhaar_no || '', pan_no || '', voter_id || '', ration_card || '', dob || '', emergency_contact || '', Number(advance_balance || 0), custId]
    );

    res.json({ message: 'Customer profile updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update customer profile.' });
  }
});

// Add advance balance deposit to customer profile
router.post('/customers/:id/add-advance', authenticateToken, requireRole('admin', 'staff'), async (req: AuthRequest, res: Response) => {
  try {
    const custId = req.params.id;
    const { amount, payment_method, notes } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'A valid positive amount is required.' });
    }

    const custs = await query(`SELECT * FROM users WHERE id = ?`, [custId]);
    if (custs.length === 0) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    const cust = custs[0];
    const oldBal = Number(cust.advance_balance || 0);
    const newBal = oldBal + Number(amount);

    await run(`UPDATE users SET advance_balance = ? WHERE id = ?`, [newBal, custId]);

    await logDiffAudit('CUSTOMER', Number(custId), cust.name, 'advance_balance', oldBal, newBal, req.user!.name, req.user!.role, 'ADVANCE_DEPOSIT');

    await logAudit(req.user!.name, req.user!.role, 'Customer Advance Deposited', `Added ₹${amount} (${payment_method || 'Cash'}) advance balance for ${cust.name}. New Bal: ₹${newBal}`);

    res.json({ message: `Successfully added ₹${amount} to advance balance.`, new_balance: newBal });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to add advance balance.' });
  }
});

// ==========================================
// PHASE 4: Granular Staff Permissions
// ==========================================

// Get list of staff users with permissions
router.get('/staff', authenticateToken, requireRole('admin', 'super_admin'), async (req: AuthRequest, res: Response) => {
  try {
    const staffList = await query(`SELECT id, name, email, mobile, role, is_active, created_at, permissions FROM users WHERE role IN ('staff', 'admin')`);
    const formatted = staffList.map((s: any) => {
      let perms = {
        can_approve_apps: true,
        can_edit_apps: true,
        can_delete_apps: s.role === 'admin' || s.role === 'super_admin',
        can_issue_receipts: true,
        can_manage_expenses: true,
        can_view_reports: true,
        can_manage_cash: true,
        can_manage_customers: true,
        can_manage_services: s.role === 'admin' || s.role === 'super_admin'
      };
      if (s.permissions) {
        try {
          perms = { ...perms, ...JSON.parse(s.permissions) };
        } catch (e) {}
      }
      return { ...s, permissions: perms };
    });
    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch staff list.' });
  }
});

// Update staff permissions
router.put('/staff/:id/permissions', authenticateToken, requireRole('admin', 'super_admin'), async (req: AuthRequest, res: Response) => {
  try {
    const staffId = req.params.id;
    const { permissions } = req.body;

    const staffRes = await query(`SELECT * FROM users WHERE id = ?`, [staffId]);
    if (staffRes.length === 0) {
      return res.status(404).json({ error: 'Staff member not found.' });
    }
    const staffUser = staffRes[0];

    const oldPerms = staffUser.permissions || '';
    const newPermsStr = JSON.stringify(permissions);

    await run(`UPDATE users SET permissions = ? WHERE id = ?`, [newPermsStr, staffId]);

    await logDiffAudit('STAFF_PERMISSIONS', Number(staffId), staffUser.name, 'permissions', oldPerms, newPermsStr, req.user!.name, req.user!.role, 'PERMISSION_CHANGE');

    res.json({ message: 'Staff permissions updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update staff permissions.' });
  }
});

// ==========================================
// PHASE 5: Daily Cash Management
// ==========================================

// Get Today's Cash Register State
router.get('/cash-register/today', authenticateToken, requireRole('admin', 'staff'), async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get today's cash collections from payments
    const cashCollRes = await query(`SELECT SUM(paid_amount) as total FROM payments WHERE payment_date LIKE ? AND payment_method = 'Cash'`, [`${today}%`]);
    const cashCollections = cashCollRes[0]?.total || 0;

    // Get today's cash expenses
    const cashExpRes = await query(`SELECT SUM(amount) as total FROM expenses WHERE date = ? AND payment_method = 'Cash'`, [today]);
    const cashExpenses = cashExpRes[0]?.total || 0;

    // Fetch register row for today
    const regRes = await query(`SELECT * FROM daily_cash_register WHERE date = ?`, [today]);

    let openingCash = 0;
    if (regRes.length === 0) {
      // Find previous day's closing cash
      const prevRes = await query(`SELECT physical_cash, expected_closing FROM daily_cash_register WHERE date < ? ORDER BY date DESC LIMIT 1`, [today]);
      if (prevRes.length > 0) {
        openingCash = Number(prevRes[0].physical_cash || prevRes[0].expected_closing || 0);
      }
    } else {
      openingCash = Number(regRes[0].opening_cash || 0);
    }

    const expectedClosing = openingCash + Number(cashCollections) - Number(cashExpenses);

    if (regRes.length === 0) {
      res.json({
        date: today,
        opening_cash: openingCash,
        cash_collections: cashCollections,
        cash_expenses: cashExpenses,
        expected_closing: expectedClosing,
        physical_cash: expectedClosing,
        variance: 0,
        notes: '',
        status: 'OPEN'
      });
    } else {
      const reg = regRes[0];
      res.json({
        ...reg,
        cash_collections: cashCollections,
        cash_expenses: cashExpenses,
        expected_closing: expectedClosing,
        variance: Number(reg.physical_cash || expectedClosing) - expectedClosing
      });
    }
  } catch (err: any) {
    console.error('Cash register error:', err);
    res.status(500).json({ error: 'Failed to fetch cash register data.' });
  }
});

// Set Opening Cash for Today
router.post('/cash-register/open', authenticateToken, requireRole('admin', 'staff'), async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { opening_cash } = req.body;
    const now = new Date().toISOString();

    const openAmt = Number(opening_cash || 0);

    const existing = await query(`SELECT * FROM daily_cash_register WHERE date = ?`, [today]);
    if (existing.length === 0) {
      await run(
        `INSERT INTO daily_cash_register (date, opening_cash, cash_collections, cash_expenses, expected_closing, physical_cash, variance, status, opened_by, created_at, updated_at)
         VALUES (?, ?, 0, 0, ?, ?, 0, 'OPEN', ?, ?, ?)`,
        [today, openAmt, openAmt, openAmt, req.user!.name, now, now]
      );
    } else {
      await run(
        `UPDATE daily_cash_register SET opening_cash = ?, opened_by = ?, updated_at = ? WHERE date = ?`,
        [openAmt, req.user!.name, now, today]
      );
    }

    await logAudit(req.user!.name, req.user!.role, 'Daily Cash Register Opened', `Set opening cash to ₹${openAmt} for date ${today}`);

    res.json({ message: 'Opening cash saved.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update opening cash.' });
  }
});

// Reconcile and Lock Cash Register for Today
router.post('/cash-register/reconcile', authenticateToken, requireRole('admin', 'staff'), async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { physical_cash, notes, lock } = req.body;
    const now = new Date().toISOString();

    const physAmt = Number(physical_cash || 0);

    // Calculate current expected
    const cashCollRes = await query(`SELECT SUM(paid_amount) as total FROM payments WHERE payment_date LIKE ? AND payment_method = 'Cash'`, [`${today}%`]);
    const cashCollections = cashCollRes[0]?.total || 0;
    const cashExpRes = await query(`SELECT SUM(amount) as total FROM expenses WHERE date = ? AND payment_method = 'Cash'`, [today]);
    const cashExpenses = cashExpRes[0]?.total || 0;

    const existing = await query(`SELECT * FROM daily_cash_register WHERE date = ?`, [today]);
    let openingCash = 0;
    if (existing.length > 0) openingCash = Number(existing[0].opening_cash || 0);

    const expectedClosing = openingCash + Number(cashCollections) - Number(cashExpenses);
    const variance = physAmt - expectedClosing;
    const status = lock ? 'LOCKED' : 'RECONCILED';

    if (existing.length === 0) {
      await run(
        `INSERT INTO daily_cash_register (date, opening_cash, cash_collections, cash_expenses, expected_closing, physical_cash, variance, notes, status, opened_by, closed_by, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [today, openingCash, cashCollections, cashExpenses, expectedClosing, physAmt, variance, notes || '', status, req.user!.name, req.user!.name, now, now]
      );
    } else {
      await run(
        `UPDATE daily_cash_register SET cash_collections = ?, cash_expenses = ?, expected_closing = ?, physical_cash = ?, variance = ?, notes = ?, status = ?, closed_by = ?, updated_at = ? WHERE date = ?`,
        [cashCollections, cashExpenses, expectedClosing, physAmt, variance, notes || '', status, req.user!.name, now, today]
      );
    }

    await logAudit(req.user!.name, req.user!.role, 'Daily Cash Reconciled', `Date: ${today}, Physical: ₹${physAmt}, Expected: ₹${expectedClosing}, Variance: ₹${variance}, Status: ${status}`);

    res.json({ message: `Cash register successfully ${status === 'LOCKED' ? 'locked' : 'reconciled'}.`, variance });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to reconcile cash register.' });
  }
});

// Cash Register History
router.get('/cash-register/history', authenticateToken, requireRole('admin', 'staff'), async (req: AuthRequest, res: Response) => {
  try {
    const history = await query(`SELECT * FROM daily_cash_register ORDER BY date DESC LIMIT 30`);
    res.json(history);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch cash register history.' });
  }
});

// ==========================================
// PHASE 6: Audit Diff Logs & Comprehensive Reports
// ==========================================

// Audit Diff Logs Endpoint
router.get('/audit-diff-logs', authenticateToken, requireRole('admin', 'super_admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { entity_type, limit } = req.query;
    let sql = `SELECT * FROM audit_diff_logs WHERE 1=1`;
    const params: any[] = [];

    if (entity_type) {
      sql += ` AND entity_type = ?`;
      params.push(entity_type);
    }

    sql += ` ORDER BY id DESC LIMIT ` + (Number(limit) || 100);
    const logs = await query(sql, params);
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch audit diff logs.' });
  }
});

// Service Profitability Report
router.get('/reports/service-profitability', authenticateToken, requireRole('admin', 'staff'), async (req: AuthRequest, res: Response) => {
  try {
    const services = await query(`SELECT * FROM services ORDER BY title ASC`);
    const appStats = await query(`
      SELECT service_name, COUNT(*) as app_count, SUM(total_amount) as gross_revenue, SUM(paid_amount) as total_collected
      FROM applications
      GROUP BY service_name
    `);

    const statsMap = new Map();
    appStats.forEach((s: any) => {
      statsMap.set(s.service_name, s);
    });

    const report = services.map((srv: any) => {
      const stat = statsMap.get(srv.title) || { app_count: 0, gross_revenue: 0, total_collected: 0 };
      const centerFee = srv.service_charge || 0;
      const govtFee = srv.govt_fee || 0;
      const estMarginPerApp = centerFee;
      const totalMargin = stat.app_count * estMarginPerApp;

      return {
        service_id: srv.id,
        title: srv.title,
        category: srv.category,
        service_charge: centerFee,
        govt_fee: govtFee,
        total_price: centerFee + govtFee,
        application_count: stat.app_count,
        gross_revenue: stat.gross_revenue,
        total_collected: stat.total_collected,
        estimated_center_margin: totalMargin
      };
    });

    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate service profitability report.' });
  }
});

// Pending Dues Customer Report
router.get('/reports/pending-dues', authenticateToken, requireRole('admin', 'staff'), async (req: AuthRequest, res: Response) => {
  try {
    const pendingApps = await query(`
      SELECT a.*, u.advance_balance
      FROM applications a
      LEFT JOIN users u ON a.customer_id = u.id
      WHERE a.pending_amount > 0
      ORDER BY a.pending_amount DESC
    `);
    res.json(pendingApps);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch pending dues report.' });
  }
});

// Customer Ledger Report
router.get('/reports/customer-ledger/:id', authenticateToken, requireRole('admin', 'staff'), async (req: AuthRequest, res: Response) => {
  try {
    const custId = req.params.id;
    const custs = await query(`SELECT * FROM users WHERE id = ?`, [custId]);
    if (custs.length === 0) {
      return res.status(404).json({ error: 'Customer not found.' });
    }
    const customer = custs[0];

    const apps = await query(`SELECT * FROM applications WHERE customer_id = ? OR customer_mobile = ? ORDER BY id DESC`, [custId, customer.mobile]);
    const payments = await query(`SELECT * FROM payments WHERE customer_mobile = ? ORDER BY id DESC`, [customer.mobile]);
    const diffLogs = await query(`SELECT * FROM audit_diff_logs WHERE entity_type = 'CUSTOMER' AND entity_id = ? ORDER BY id DESC`, [custId]);

    res.json({
      customer,
      applications: apps,
      payments,
      audit_trail: diffLogs
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch customer ledger.' });
  }
});

export default router;
