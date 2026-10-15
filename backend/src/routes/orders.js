import { Router } from 'express';
import { pool, query } from '../db.js';
import { requireAuth } from '../middleware.js';
import { buildCart } from './cart.js';
import { normalizeDigits, PAYMENT_METHODS, toInt } from '../utils.js';

const router = Router();
const PHONE_RE = /^09\d{9}$/;

async function withItems(orderRows) {
  if (!orderRows.length) return orderRows;
  const ids = orderRows.map((order) => order.id);
  const { rows: items } = await query(
    'SELECT * FROM order_items WHERE order_id = ANY($1::int[]) ORDER BY id',
    [ids]
  );
  return orderRows.map((order) => ({
    ...order,
    items: items.filter((item) => item.order_id === order.id),
  }));
}

router.post('/', requireAuth, async (req, res, next) => {
  const client = await pool.connect();
  try {
    const cart = await buildCart(req.sessionID);
    if (!cart.items.length) {
      return res.status(400).json({ error: 'سبد خرید شما خالی است.' });
    }

    const customerName = String(req.body?.customer_name || '').trim();
    const phone = normalizeDigits(String(req.body?.phone || '').trim().replace(/[\s-]/g, ''));
    const address = String(req.body?.address || '').trim();
    const note = String(req.body?.note || '').trim();
    const paymentMethod = PAYMENT_METHODS.includes(req.body?.payment_method)
      ? req.body.payment_method
      : 'cash';

    const errors = {};
    if (customerName.length < 3) errors.customer_name = 'نام و نام خانوادگی را کامل وارد کنید.';
    if (!PHONE_RE.test(phone)) errors.phone = 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.';
    if (address.length < 10) errors.address = 'نشانی را کامل‌تر وارد کنید (حداقل ۱۰ کاراکتر).';
    if (Object.keys(errors).length) {
      return res.status(400).json({ error: 'لطفاً خطاهای فرم را برطرف کنید.', errors });
    }

    const unavailable = cart.items.filter((item) => !item.is_available);
    if (unavailable.length) {
      return res.status(409).json({
        error: `این محصولات دیگر موجود نیستند: ${unavailable.map((i) => i.name).join('، ')}`,
      });
    }

    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO orders (user_id, customer_name, phone, address, note, payment_method, subtotal, delivery_fee, total)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        req.session.userId,
        customerName,
        phone,
        address,
        note,
        paymentMethod,
        cart.subtotal,
        cart.delivery_fee,
        cart.total,
      ]
    );
    const order = rows[0];

    for (const item of cart.items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, line_total)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.id, item.product_id, item.name, item.price, item.quantity, item.line_total]
      );
    }

    // The order now owns the priced lines, so the cart is cleared.
    await client.query(
      'DELETE FROM cart_items WHERE cart_id = (SELECT id FROM carts WHERE session_id = $1)',
      [req.sessionID]
    );
    await client.query('COMMIT');

    const [withLines] = await withItems([order]);
    res.status(201).json({ order: withLines });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    next(error);
  } finally {
    client.release();
  }
});

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC, id DESC',
      [req.session.userId]
    );
    res.json({ orders: await withItems(rows) });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [
      toInt(req.params.id),
      req.session.userId,
    ]);
    if (!rows[0]) return res.status(404).json({ error: 'این سفارش پیدا نشد.' });
    const [order] = await withItems(rows);
    res.json({ order });
  } catch (error) {
    next(error);
  }
});

export default router;
