import { query } from './db.js';

export function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'برای این کار باید وارد حساب کاربری خود شوید.' });
  }
  next();
}

export async function requireAdmin(req, res, next) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'برای دسترسی به پنل مدیریت باید وارد شوید.' });
    }
    const { rows } = await query('SELECT id, name, email, role FROM users WHERE id = $1', [
      req.session.userId,
    ]);
    const user = rows[0];
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'این بخش فقط برای مدیران در دسترس است.' });
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
