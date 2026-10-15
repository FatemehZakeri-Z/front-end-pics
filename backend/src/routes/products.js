import { Router } from 'express';
import { query } from '../db.js';
import { toInt } from '../utils.js';

const router = Router();

router.get('/categories', async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT category, COUNT(*)::int AS count FROM products GROUP BY category ORDER BY category'
    );
    res.json({ categories: rows });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();
    const category = String(req.query.category || '').trim();
    const sort = String(req.query.sort || 'popular');
    const min = req.query.min ? toInt(req.query.min, 0) : null;
    const max = req.query.max ? toInt(req.query.max, 0) : null;

    const conditions = [];
    const params = [];

    if (q) {
      params.push(`%${q}%`);
      conditions.push(`(name ILIKE $${params.length} OR description ILIKE $${params.length})`);
    }
    if (category && category !== 'all') {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }
    if (min !== null) {
      params.push(min);
      conditions.push(`price >= $${params.length}`);
    }
    if (max !== null) {
      params.push(max);
      conditions.push(`price <= $${params.length}`);
    }
    if (req.query.popular === 'true') {
      conditions.push('is_popular = true');
    }

    const orderBy =
      {
        price_asc: 'price ASC',
        price_desc: 'price DESC',
        newest: 'created_at DESC, id DESC',
        name: 'name ASC',
      }[sort] || 'is_popular DESC, id ASC';

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await query(`SELECT * FROM products ${where} ORDER BY ${orderBy}`, params);
    res.json({ products: rows, count: rows.length });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM products WHERE id = $1', [toInt(req.params.id)]);
    if (!rows[0]) return res.status(404).json({ error: 'این محصول پیدا نشد.' });
    res.json({ product: rows[0] });
  } catch (error) {
    next(error);
  }
});

export default router;
