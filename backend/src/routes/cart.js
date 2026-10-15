import { Router } from 'express';
import { query } from '../db.js';
import { DELIVERY_FEE, FREE_DELIVERY_OVER, toInt } from '../utils.js';

const router = Router();
const MAX_QUANTITY = 20;

export async function getCartId(sessionId, userId = null) {
  const existing = await query('SELECT id FROM carts WHERE session_id = $1', [sessionId]);
  if (existing.rowCount) return existing.rows[0].id;
  const created = await query(
    `INSERT INTO carts (session_id, user_id) VALUES ($1, $2)
     ON CONFLICT (session_id) DO UPDATE SET session_id = EXCLUDED.session_id
     RETURNING id`,
    [sessionId, userId]
  );
  return created.rows[0].id;
}

/** Builds the cart payload (items + totals) the frontend renders. */
export async function buildCart(sessionId) {
  const cartId = await getCartId(sessionId);
  const { rows } = await query(
    `SELECT ci.id, ci.quantity, p.id AS product_id, p.name, p.price, p.image_url, p.category,
            p.is_available, (ci.quantity * p.price) AS line_total
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.cart_id = $1
     ORDER BY ci.id`,
    [cartId]
  );

  const subtotal = rows.reduce((sum, item) => sum + Number(item.line_total), 0);
  const deliveryFee = subtotal === 0 || subtotal >= FREE_DELIVERY_OVER ? 0 : DELIVERY_FEE;

  return {
    items: rows.map((row) => ({
      ...row,
      price: Number(row.price),
      line_total: Number(row.line_total),
    })),
    count: rows.reduce((sum, item) => sum + item.quantity, 0),
    subtotal,
    delivery_fee: deliveryFee,
    total: subtotal + deliveryFee,
    free_delivery_over: FREE_DELIVERY_OVER,
  };
}

router.get('/', async (req, res, next) => {
  try {
    res.json(await buildCart(req.sessionID));
  } catch (error) {
    next(error);
  }
});

router.post('/items', async (req, res, next) => {
  try {
    const productId = toInt(req.body?.product_id);
    const quantity = Math.max(1, Math.min(MAX_QUANTITY, toInt(req.body?.quantity, 1)));

    const product = await query('SELECT id, is_available FROM products WHERE id = $1', [productId]);
    if (!product.rows[0]) return res.status(404).json({ error: 'این محصول پیدا نشد.' });
    if (!product.rows[0].is_available) {
      return res.status(400).json({ error: 'این محصول در حال حاضر موجود نیست.' });
    }

    const cartId = await getCartId(req.sessionID, req.session.userId || null);
    await query(
      `INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)
       ON CONFLICT (cart_id, product_id)
       DO UPDATE SET quantity = LEAST(cart_items.quantity + EXCLUDED.quantity, $4)`,
      [cartId, productId, quantity, MAX_QUANTITY]
    );

    res.status(201).json(await buildCart(req.sessionID));
  } catch (error) {
    next(error);
  }
});

router.patch('/items/:id', async (req, res, next) => {
  try {
    const itemId = toInt(req.params.id);
    const quantity = toInt(req.body?.quantity);
    const cartId = await getCartId(req.sessionID);

    if (quantity < 1) {
      await query('DELETE FROM cart_items WHERE id = $1 AND cart_id = $2', [itemId, cartId]);
    } else {
      const result = await query(
        'UPDATE cart_items SET quantity = $1 WHERE id = $2 AND cart_id = $3',
        [Math.min(MAX_QUANTITY, quantity), itemId, cartId]
      );
      if (!result.rowCount) return res.status(404).json({ error: 'این آیتم در سبد خرید نیست.' });
    }

    res.json(await buildCart(req.sessionID));
  } catch (error) {
    next(error);
  }
});

router.delete('/items/:id', async (req, res, next) => {
  try {
    const cartId = await getCartId(req.sessionID);
    const result = await query('DELETE FROM cart_items WHERE id = $1 AND cart_id = $2', [
      toInt(req.params.id),
      cartId,
    ]);
    if (!result.rowCount) return res.status(404).json({ error: 'این آیتم در سبد خرید نیست.' });
    res.json(await buildCart(req.sessionID));
  } catch (error) {
    next(error);
  }
});

router.delete('/', async (req, res, next) => {
  try {
    const cartId = await getCartId(req.sessionID);
    await query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
    res.json(await buildCart(req.sessionID));
  } catch (error) {
    next(error);
  }
});

export default router;
