import { Router, Response } from 'express';
import { query, run, logAudit } from '../db';
import { authenticateToken, requireRole, AuthRequest } from '../middleware';

const router = Router();

// Get expense logs
router.get('/', authenticateToken, requireRole('admin', 'staff'), async (req: AuthRequest, res: Response) => {
  try {
    const { category, search, start_date, end_date } = req.query;
    let sql = 'SELECT * FROM expenses WHERE 1=1';
    const params: any[] = [];

    if (category && category !== 'ALL') {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      sql += ' AND (description LIKE ? OR category LIKE ? OR added_by_name LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (start_date && end_date) {
      sql += ' AND date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }

    sql += ' ORDER BY id DESC';

    const expenses = await query(sql, params);
    res.json(expenses);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch expenses.' });
  }
});

// Add new expense
router.post('/', authenticateToken, requireRole('admin', 'staff'), async (req: AuthRequest, res: Response) => {
  try {
    const { category, amount, date, description, payment_method } = req.body;

    if (!category || !amount || amount <= 0 || !description) {
      return res.status(400).json({ error: 'Category, valid amount, and description are required.' });
    }

    const expDate = date || new Date().toISOString().split('T')[0];
    const createdAt = new Date().toISOString();

    const result = await run(
      `INSERT INTO expenses (category, amount, date, description, payment_method, added_by_id, added_by_name, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [category, Number(amount), expDate, description, payment_method || 'Cash', req.user!.id, req.user!.name, createdAt]
    );

    await logAudit(req.user!.name, req.user!.role, 'Expense Added', `Added ${category} expense of ₹${amount}`);

    res.json({ id: result.lastInsertRowid, message: 'Expense logged successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to add expense.' });
  }
});

// Delete expense (Admin only)
router.delete('/:id', authenticateToken, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    await run('DELETE FROM expenses WHERE id = ?', [req.params.id]);
    await logAudit(req.user!.name, req.user!.role, 'Expense Deleted', `Deleted expense ID: ${req.params.id}`);
    res.json({ message: 'Expense deleted.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete expense.' });
  }
});

export default router;
