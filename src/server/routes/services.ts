import { Router, Response } from 'express';
import { query, run, logAudit } from '../db';
import { authenticateToken, requireRole, AuthRequest } from '../middleware';

const router = Router();

// Get all active services (or all for admin/staff)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { category, search, all } = req.query;
    let sql = 'SELECT * FROM services WHERE 1=1';
    const params: any[] = [];

    if (!all || all === 'false') {
      sql += ' AND active = 1';
    }

    if (category && category !== 'ALL') {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      sql += ' AND (title LIKE ? OR description LIKE ? OR subcategory LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY id ASC';

    const services = await query(sql, params);

    // Parse JSON string fields
    const formatted = services.map((s: any) => ({
      ...s,
      required_documents: JSON.parse(s.required_documents || '[]'),
      active: Boolean(s.active)
    }));

    res.json(formatted);
  } catch (err: any) {
    console.error('Fetch services error:', err);
    res.status(500).json({ error: 'Failed to fetch services.' });
  }
});

// Get single service by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const services = await query('SELECT * FROM services WHERE id = ?', [req.params.id]);
    if (services.length === 0) {
      return res.status(404).json({ error: 'Service not found.' });
    }
    const s = services[0];
    res.json({
      ...s,
      required_documents: JSON.parse(s.required_documents || '[]'),
      active: Boolean(s.active)
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch service.' });
  }
});

// Create service (Admin only)
router.post('/', authenticateToken, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, category, subcategory, icon_name, description, required_documents, processing_time, service_charge, govt_fee, instructions } = req.body;

    if (!title || !category || !description) {
      return res.status(400).json({ error: 'Title, category, and description are required.' });
    }

    const docsJson = JSON.stringify(required_documents || []);

    const result = await run(
      `INSERT INTO services (title, category, subcategory, icon_name, description, required_documents, processing_time, service_charge, govt_fee, instructions, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        title,
        category,
        subcategory || '',
        icon_name || 'FileText',
        description,
        docsJson,
        processing_time || '1-3 Days',
        Number(service_charge) || 0,
        Number(govt_fee) || 0,
        instructions || ''
      ]
    );

    await logAudit(req.user!.name, req.user!.role, 'Service Created', `Created service: ${title}`);

    res.json({ id: result.lastInsertRowid, message: 'Service added successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create service.' });
  }
});

// Update service (Admin only)
router.put('/:id', authenticateToken, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, category, subcategory, icon_name, description, required_documents, processing_time, service_charge, govt_fee, instructions, active } = req.body;

    const docsJson = JSON.stringify(required_documents || []);

    await run(
      `UPDATE services SET title=?, category=?, subcategory=?, icon_name=?, description=?, required_documents=?, processing_time=?, service_charge=?, govt_fee=?, instructions=?, active=?
       WHERE id=?`,
      [
        title,
        category,
        subcategory || '',
        icon_name || 'FileText',
        description,
        docsJson,
        processing_time,
        Number(service_charge) || 0,
        Number(govt_fee) || 0,
        instructions || '',
        active ? 1 : 0,
        req.params.id
      ]
    );

    await logAudit(req.user!.name, req.user!.role, 'Service Updated', `Updated service ID: ${req.params.id}`);

    res.json({ message: 'Service updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update service.' });
  }
});

// Toggle service active status
router.delete('/:id', authenticateToken, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    await run(`UPDATE services SET active = CASE WHEN active = 1 THEN 0 ELSE 1 END WHERE id = ?`, [req.params.id]);
    res.json({ message: 'Service status toggled.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to toggle service status.' });
  }
});

export default router;
