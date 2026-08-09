import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { query, run, logAudit, logDiffAudit } from '../db';
import { authenticateToken, requireRole, AuthRequest } from '../middleware';

const router = Router();

// Configure file storage
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'doc-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, Images, and Word documents are permitted.'));
    }
  }
});

// Helper to generate Application ID
function generateAppNo(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `CSC-${year}-${random}`;
}

// Track application by App ID + Mobile Number (PUBLIC)
router.get('/track', async (req: AuthRequest, res: Response) => {
  try {
    const { app_no, mobile } = req.query;

    if (!app_no || !mobile) {
      return res.status(400).json({ error: 'Both Application ID and Mobile Number are required.' });
    }

    const apps = await query(
      `SELECT * FROM applications WHERE UPPER(TRIM(application_no)) = UPPER(TRIM(?)) AND TRIM(customer_mobile) = TRIM(?)`,
      [String(app_no), String(mobile)]
    );

    if (apps.length === 0) {
      return res.status(404).json({ error: 'No application found with the provided Application ID and Mobile Number.' });
    }

    const app = apps[0];
    const docs = await query(`SELECT * FROM application_documents WHERE application_id = ?`, [app.id]);
    const payments = await query(`SELECT * FROM payments WHERE application_id = ?`, [app.id]);

    res.json({
      ...app,
      documents: docs,
      payments
    });
  } catch (err: any) {
    console.error('Track application error:', err);
    res.status(500).json({ error: 'Failed to track application.' });
  }
});

// List applications (Filterable by role, status, search)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { status, search, limit } = req.query;

    let sql = 'SELECT * FROM applications WHERE 1=1';
    const params: any[] = [];

    // Customers only see their own applications
    if (user.role === 'customer') {
      sql += ' AND (customer_id = ? OR customer_email = ? OR customer_mobile = ?)';
      params.push(user.id, user.email, user.mobile);
    }

    if (status && status !== 'ALL') {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      sql += ' AND (application_no LIKE ? OR customer_name LIKE ? OR customer_mobile LIKE ? OR service_name LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    sql += ' ORDER BY id DESC';

    if (limit) {
      sql += ' LIMIT ' + Number(limit);
    }

    const apps = await query(sql, params);
    res.json(apps);
  } catch (err: any) {
    console.error('Fetch applications error:', err);
    res.status(500).json({ error: 'Failed to fetch applications.' });
  }
});

// Get single application with documents
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const apps = await query('SELECT * FROM applications WHERE id = ?', [req.params.id]);
    if (apps.length === 0) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    const app = apps[0];
    // Security check for customer
    if (req.user!.role === 'customer' && app.customer_id !== req.user!.id && app.customer_email !== req.user!.email) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const docs = await query('SELECT * FROM application_documents WHERE application_id = ?', [app.id]);
    const payments = await query('SELECT * FROM payments WHERE application_id = ?', [app.id]);

    res.json({
      ...app,
      documents: docs,
      payments
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch application details.' });
  }
});

// Submit new application (Public or Authenticated)
router.post('/', upload.array('documents', 10), async (req: AuthRequest, res: Response) => {
  try {
    const {
      customer_name,
      customer_mobile,
      customer_email,
      address,
      dob,
      service_id,
      additional_info,
      preferred_appointment_date,
      payment_option,
      initial_payment_amount
    } = req.body;

    if (!customer_name || !customer_mobile || !service_id) {
      return res.status(400).json({ error: 'Customer Name, Mobile, and Service selection are required.' });
    }

    // Fetch service details
    const services = await query('SELECT * FROM services WHERE id = ?', [service_id]);
    if (services.length === 0) {
      return res.status(400).json({ error: 'Selected service does not exist.' });
    }
    const service = services[0];

    const totalAmount = Number(service.service_charge) + Number(service.govt_fee);
    let paidAmount = 0;

    if (payment_option && payment_option !== 'Pay at Center') {
      paidAmount = Number(initial_payment_amount) || totalAmount;
    }

    const pendingAmount = Math.max(0, totalAmount - paidAmount);
    const appNo = generateAppNo();
    const now = new Date().toISOString();
    const custId = req.user?.id || null;

    const result = await run(
      `INSERT INTO applications
       (application_no, customer_id, customer_name, customer_mobile, customer_email, address, dob, service_id, service_name, category, additional_info, status, status_notes, preferred_appointment_date, payment_option, total_amount, paid_amount, pending_amount, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Submitted', 'Application received. Documents pending verification.', ?, ?, ?, ?, ?, ?, ?)`,
      [
        appNo,
        custId,
        customer_name,
        customer_mobile,
        customer_email || '',
        address || '',
        dob || '',
        service.id,
        service.title,
        service.category,
        additional_info || '',
        preferred_appointment_date || '',
        payment_option || 'Pay at Center',
        totalAmount,
        paidAmount,
        pendingAmount,
        now,
        now
      ]
    );

    const appId = result.lastInsertRowid;

    // Process uploaded documents
    const files = (req.files as Express.Multer.File[]) || [];
    for (const f of files) {
      await run(
        `INSERT INTO application_documents (application_id, document_name, file_path, file_type, file_size, uploaded_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [appId, f.originalname, `/uploads/${f.filename}`, f.mimetype, f.size, now]
      );
    }

    // Record initial payment if made
    if (paidAmount > 0) {
      const txId = 'UPI' + Math.floor(10000000 + Math.random() * 90000000);
      await run(
        `INSERT INTO payments (application_id, application_no, customer_name, customer_mobile, service_name, total_amount, paid_amount, pending_amount, payment_method, transaction_id, staff_name, payment_status, payment_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          appId,
          appNo,
          customer_name,
          customer_mobile,
          service.title,
          totalAmount,
          paidAmount,
          pendingAmount,
          payment_option,
          txId,
          'Online Gateway',
          pendingAmount === 0 ? 'Paid' : 'Partially Paid',
          now
        ]
      );
    }

    // Create Notification
    await run(
      `INSERT INTO notifications (user_id, title, message, is_read, link, created_at)
       VALUES (?, ?, ?, 0, ?, ?)`,
      [
        custId,
        'Application Submitted',
        `Your application ${appNo} for ${service.title} has been submitted successfully. Total fee: ₹${totalAmount}.`,
        `/track?app_no=${appNo}&mobile=${customer_mobile}`,
        now
      ]
    );

    await logAudit(customer_name, req.user?.role || 'customer', 'Application Submitted', `Application ID: ${appNo} for service ${service.title}`);

    res.json({
      success: true,
      application_no: appNo,
      application_id: appId,
      total_amount: totalAmount,
      paid_amount: paidAmount,
      pending_amount: pendingAmount,
      message: 'Application submitted successfully!'
    });
  } catch (err: any) {
    console.error('Submit application error:', err);
    res.status(500).json({ error: err.message || 'Failed to submit application.' });
  }
});

// Update Application Status (Admin/Staff only)
router.put('/:id/status', authenticateToken, requireRole('admin', 'staff'), async (req: AuthRequest, res: Response) => {
  try {
    const { status, status_notes } = req.body;
    const appId = req.params.id;

    if (!status) {
      return res.status(400).json({ error: 'Status is required.' });
    }

    const apps = await query('SELECT * FROM applications WHERE id = ?', [appId]);
    if (apps.length === 0) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    const app = apps[0];
    const now = new Date().toISOString();

    await run(
      `UPDATE applications SET status = ?, status_notes = ?, updated_at = ? WHERE id = ?`,
      [status, status_notes || '', now, appId]
    );

    if (app.status !== status) {
      await logDiffAudit('APPLICATION', Number(appId), app.application_no, 'status', app.status, status, req.user?.name || 'Staff', req.user?.role || 'staff', 'STATUS_CHANGE');
    }
    if ((app.status_notes || '') !== (status_notes || '')) {
      await logDiffAudit('APPLICATION', Number(appId), app.application_no, 'status_notes', app.status_notes || '', status_notes || '', req.user?.name || 'Staff', req.user?.role || 'staff', 'UPDATE');
    }

    // Notify customer
    await run(
      `INSERT INTO notifications (user_id, title, message, is_read, link, created_at)
       VALUES (?, ?, ?, 0, ?, ?)`,
      [
        app.customer_id,
        `Status Updated: ${app.application_no}`,
        `Your application ${app.application_no} status changed to '${status}'. ${status_notes || ''}`,
        `/track?app_no=${app.application_no}&mobile=${app.customer_mobile}`,
        now
      ]
    );

    await logAudit(req.user!.name, req.user!.role, 'Application Status Updated', `App ID: ${app.application_no} updated to ${status}`);

    res.json({ message: 'Application status updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update application status.' });
  }
});

// Upload document for an existing application
router.post('/:id/documents', upload.single('document'), async (req: AuthRequest, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const now = new Date().toISOString();
    await run(
      `INSERT INTO application_documents (application_id, document_name, file_path, file_type, file_size, uploaded_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.params.id, file.originalname, `/uploads/${file.filename}`, file.mimetype, file.size, now]
    );

    res.json({ message: 'Document uploaded successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to upload document.' });
  }
});

export default router;
