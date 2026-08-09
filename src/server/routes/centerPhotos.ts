import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { query, run, logAudit } from '../db';
import { authenticateToken, requireRole, AuthRequest } from '../middleware';

const router = Router();

// Configure file storage for center photos
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
    const ext = path.extname(file.originalname) || '.png';
    cb(null, 'center-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext) || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPG, PNG, WEBP) are allowed.'));
    }
  }
});

// GET /api/center-photos - Public route to fetch all center photos
router.get('/', async (req, res: Response) => {
  try {
    const photos = await query('SELECT * FROM center_photos ORDER BY id DESC');
    res.json(photos);
  } catch (err: any) {
    console.error('Fetch center photos error:', err);
    res.status(500).json({ error: 'Failed to fetch center photos.' });
  }
});

// POST /api/center-photos - Upload center photo (Admin & Staff only)
router.post('/', authenticateToken, requireRole('admin', 'staff'), upload.single('photo'), async (req: AuthRequest, res: Response) => {
  try {
    let imageUrl = '';
    const { title, category, description, photo_url, image_data } = req.body;

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (photo_url) {
      imageUrl = photo_url;
    } else if (image_data && image_data.startsWith('data:image')) {
      // Save base64 image data to file
      const matches = image_data.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
      if (matches) {
        const ext = matches[1] || 'png';
        const buffer = Buffer.from(matches[2], 'base64');
        const filename = `center-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
        const filePath = path.join(UPLOADS_DIR, filename);
        fs.writeFileSync(filePath, buffer);
        imageUrl = `/uploads/${filename}`;
      }
    }

    if (!imageUrl) {
      return res.status(400).json({ error: 'Photo file or valid image URL/data is required.' });
    }

    const photoTitle = title || 'Center Infrastructure';
    const photoCategory = category || 'General Facility';
    const photoDesc = description || 'Our CSC & Banking Center facility photo.';
    const now = new Date().toISOString();

    const result = await run(
      `INSERT INTO center_photos (title, category, description, image_url, uploaded_at)
       VALUES (?, ?, ?, ?, ?)`,
      [photoTitle, photoCategory, photoDesc, imageUrl, now]
    );

    const newPhoto = {
      id: result.lastInsertRowid,
      title: photoTitle,
      category: photoCategory,
      description: photoDesc,
      image_url: imageUrl,
      uploaded_at: now
    };

    if (req.user) {
      await logAudit(req.user.name, req.user.role, 'Center Photo Uploaded', `Uploaded photo: ${photoTitle}`);
    }

    res.json({
      success: true,
      message: 'Center photo uploaded successfully!',
      photo: newPhoto
    });
  } catch (err: any) {
    console.error('Upload center photo error:', err);
    res.status(500).json({ error: err.message || 'Failed to upload center photo.' });
  }
});

// DELETE /api/center-photos/:id - Delete center photo (Admin / Staff)
router.delete('/:id', authenticateToken, requireRole('admin', 'staff'), async (req: AuthRequest, res: Response) => {
  try {
    const photoId = req.params.id;
    const photos = await query('SELECT * FROM center_photos WHERE id = ?', [photoId]);

    if (photos.length === 0) {
      return res.status(404).json({ error: 'Photo not found.' });
    }

    const photo = photos[0];

    // Remove local file if under /uploads/
    if (photo.image_url && photo.image_url.startsWith('/uploads/')) {
      const fileName = path.basename(photo.image_url);
      const filePath = path.join(UPLOADS_DIR, fileName);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error('Failed to delete file:', e);
        }
      }
    }

    await run('DELETE FROM center_photos WHERE id = ?', [photoId]);
    await logAudit(req.user!.name, req.user!.role, 'Center Photo Deleted', `Deleted photo ID: ${photoId} (${photo.title})`);

    res.json({ success: true, message: 'Center photo deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete center photo.' });
  }
});

export default router;
