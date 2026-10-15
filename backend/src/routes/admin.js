import { Router } from 'express';
import { query } from '../db.js';
import { requireAdmin } from '../middleware.js';
import { ORDER_STATUSES, toInt } from '../utils.js';

const router = Router();
router.use(requireAdmin);

function validateProduct(body) {
  const name = String(body?.name || '').trim();
  const description = String(body?.description || '').trim();
  const category = String(body?.category || '').trim();
  const imageUrl = String(body?.image_url || '').trim();
  const price = toInt(body?.price, -1);

  const errors = {};
  if (name.length < 2) errors.name = 'نام محصول را وارد کنید.';
  if (!category) errors.category = 'دسته‌بندی را وارد کنید.';
  if (price < 0) errors.price = 'قیمت باید یک عدد مثبت باشد.';

  return {
    values: {
      name,
      description,
      category,
      image_url: imageUrl,
      price: Math.max(0, price),
      is_popular: Boolean(body?.is_popular),
      is_available: body?.is_available === undefined ? true : Boolean(body.is_available),
    },
    errors,
  };
}

router.get('/stats', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT
         (SELECT COUNT(*)::int FROM products) AS products,
         (SELECT COUNT(*)::int FROM orders) AS orders,
         (SELECT COUNT(*)::int FROM orders WHERE status = 'pending') AS pending_orders,
         (SELECT COUNT(*)::int FROM users WHERE role = 'customer') AS customers,
         (SELECT COALESCE(SUM(total), 0)::int FROM orders WHERE status <> 'cancelled') AS revenue`
    );
    res.json({ stats: rows[0] });
  } catch (error) {
    next(error);
  }
});

router.get('/products', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM products ORDER BY id DESC');
    res.json({ products: rows });
  } catch (error) {
    next(error);
  }
});

router.post('/products', async (req, res, next) => {
  try {
    const { values, errors } = validateProduct(req.body);
    if (Object.keys(errors).length) {
      return res.status(400).json({ error: 'اطلاعات محصول نامعتبر است.', errors });
    }
    const { rows } = await query(
      `INSERT INTO products (name, description, price, category, image_url, is_popular, is_available)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        values.name,
        values.description,
        values.price,
        values.category,
        values.image_url,
        values.is_popular,
        values.is_available,
      ]
    );
    res.status(201).json({ product: rows[0] });
  } catch (error) {
    next(error);
  }
});

router.patch('/products/:id', async (req, res, next) => {
  try {
    const id = toInt(req.params.id);
    const existing = await query('SELECT * FROM products WHERE id = $1', [id]);
    if (!existing.rows[0]) return res.status(404).json({ error: 'این محصول پیدا نشد.' });

    const { values, errors } = validateProduct({ ...existing.rows[0], ...req.body });
    if (Object.keys(errors).length) {
      return res.status(400).json({ error: 'اطلاعات محصول نامعتبر است.', errors });
    }

    const { rows } = await query(
      `UPDATE products
       SET name = $1, description = $2, price = $3, category = $4, image_url = $5,
           is_popular = $6, is_available = $7
       WHERE id = $8 RETURNING *`,
      [
        values.name,
        values.description,
        values.price,
        values.category,
        values.image_url,
        values.is_popular,
        values.is_available,
        id,
      ]
    );
    res.json({ product: rows[0] });
  } catch (error) {
    next(error);
  }
});

router.delete('/products/:id', async (req, res, next) => {
  try {
    const result = await query('DELETE FROM products WHERE id = $1 RETURNING id', [
      toInt(req.params.id),
    ]);
    if (!result.rowCount) return res.status(404).json({ error: 'این محصول پیدا نشد.' });
    res.json({ ok: true, id: result.rows[0].id });
  } catch (error) {
    next(error);
  }
});

router.get('/orders', async (req, res, next) => {
  try {
    const orders = await query(
      `SELECT o.*, u.email AS user_email
       FROM orders o LEFT JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC, o.id DESC`
    );
    const ids = orders.rows.map((order) => order.id);
    const items = ids.length
      ? await query('SELECT * FROM order_items WHERE order_id = ANY($1::int[]) ORDER BY id', [ids])
      : { rows: [] };
    res.json({
      orders: orders.rows.map((order) => ({
        ...order,
        items: items.rows.filter((item) => item.order_id === order.id),
      })),
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/orders/:id', async (req, res, next) => {
  try {
    const status = String(req.body?.status || '');
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'وضعیت سفارش نامعتبر است.' });
    }
    const { rows } = await query('UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', [
      status,
      toInt(req.params.id),
    ]);
    if (!rows[0]) return res.status(404).json({ error: 'این سفارش پیدا نشد.' });
    res.json({ order: rows[0] });
  } catch (error) {
    next(error);
  }
});

export default router;
