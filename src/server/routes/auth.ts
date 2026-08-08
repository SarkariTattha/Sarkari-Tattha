import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, run, logAudit } from '../db';
import { authenticateToken, AuthRequest, JWT_SECRET } from '../middleware';

const router = Router();

// Register new customer
router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, mobile, password, address } = req.body;

    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ error: 'Name, Email, Mobile and Password are required.' });
    }

    const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const createdAt = new Date().toISOString();

    const result = await run(
      `INSERT INTO users (name, email, mobile, password_hash, role, address, created_at)
       VALUES (?, ?, ?, ?, 'customer', ?, ?)`,
      [name, email, mobile, passwordHash, address || '', createdAt]
    );

    const user = { id: result.lastInsertRowid, name, email, mobile, role: 'customer', address };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

    await logAudit(name, 'customer', 'User Registered', `New customer registered: ${email}`);

    res.json({ token, user });
  } catch (err: any) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message || 'Registration failed.' });
  }
});

// Login
router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const users = await query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = users[0];

    if (user.is_active === 0) {
      return res.status(403).json({ error: 'This account has been deactivated. Please contact the center administrator.' });
    }

    const match = bcrypt.compareSync(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      address: user.address
    };

    const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '7d' });

    await logAudit(user.name, user.role, 'User Login', `Logged in successfully: ${user.email}`);

    res.json({ token, user: userData });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed.' });
  }
});

// Current User Profile
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const users = await query('SELECT id, name, email, mobile, role, address, created_at FROM users WHERE id = ?', [req.user!.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json(users[0]);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
});

// Update Profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { name, mobile, address } = req.body;
    await run(
      `UPDATE users SET name = ?, mobile = ?, address = ? WHERE id = ?`,
      [name, mobile, address, req.user!.id]
    );
    res.json({ message: 'Profile updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

export default router;
