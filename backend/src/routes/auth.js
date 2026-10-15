import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(row) {
  return { id: row.id, name: row.name, email: row.email, role: row.role };
}

router.get('/me', async (req, res, next) => {
  try {
    if (!req.session.userId) return res.json({ user: null });
    const { rows } = await query('SELECT id, name, email, role FROM users WHERE id = $1', [
      req.session.userId,
    ]);
    if (!rows[0]) {
      req.session.userId = null;
      return res.json({ user: null });
    }
    res.json({ user: publicUser(rows[0]) });
  } catch (error) {
    next(error);
  }
});

router.post('/register', async (req, res, next) => {
  try {
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    const errors = {};

    if (name.length < 3) errors.name = 'نام باید حداقل ۳ حرف باشد.';
    if (!EMAIL_RE.test(email)) errors.email = 'ایمیل معتبر نیست.';
    if (password.length < 6) errors.password = 'رمز عبور باید حداقل ۶ کاراکتر باشد.';
    if (Object.keys(errors).length) {
      return res.status(400).json({ error: 'اطلاعات وارد شده نامعتبر است.', errors });
    }

    const existing = await query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (existing.rowCount) {
      return res
        .status(409)
        .json({ error: 'این ایمیل قبلاً ثبت شده است.', errors: { email: 'این ایمیل قبلاً ثبت شده است.' } });
    }

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, role',
      [name, email, hash]
    );
    req.session.userId = rows[0].id;
    res.status(201).json({ user: publicUser(rows[0]) });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    if (!email || !password) {
      return res.status(400).json({ error: 'ایمیل و رمز عبور را وارد کنید.' });
    }
    const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];
    const valid = user ? await bcrypt.compare(password, user.password_hash) : false;
    if (!valid) {
      return res.status(401).json({ error: 'ایمیل یا رمز عبور اشتباه است.' });
    }
    req.session.userId = user.id;
    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', (req, res) => {
  req.session.userId = null;
  res.json({ ok: true });
});

export default router;
