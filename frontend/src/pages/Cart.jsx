import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatPrice } from '../utils.js';

export default function Cart() {
  const { cart, updateQuantity, remove, clear, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const changeQuantity = async (item, quantity) => {
    setError('');
    setBusyId(item.id);
    try {
      await updateQuantity(item.id, quantity);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const removeItem = async (item) => {
    setError('');
    setBusyId(item.id);
    try {
      await remove(item.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="container page">
        <p className="muted">در حال بارگذاری سبد خرید…</p>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="container page">
        <div className="empty-state">
          <h2>سبد خرید شما خالی است</h2>
          <p>از منو یک غذای خوشمزه انتخاب کنید.</p>
          <Link to="/menu" className="btn btn-primary">
            مشاهده منو
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container page">
      <div className="section-head">
        <div>
          <span className="eyebrow">سبد خرید</span>
          <h2>سفارش شما</h2>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={clear}>
          خالی کردن سبد
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="cart-layout">
        <ul className="cart-list">
          {cart.items.map((item) => (
            <li key={item.id} className="cart-item">
              <img src={item.image_url} alt={item.name} />
              <div className="cart-item-body">
                <Link to={`/menu/${item.product_id}`} className="cart-item-name">
                  {item.name}
                </Link>
                <span className="muted">{formatPrice(item.price)}</span>
              </div>

              <div className="qty">
                <button
                  type="button"
                  onClick={() => changeQuantity(item, item.quantity - 1)}
                  disabled={busyId === item.id}
                  aria-label="کاهش تعداد"
                >
                  −
                </button>
                <span>{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => changeQuantity(item, item.quantity + 1)}
                  disabled={busyId === item.id || item.quantity >= 20}
                  aria-label="افزایش تعداد"
                >
                  +
                </button>
              </div>

              <strong className="cart-line-total">{formatPrice(item.line_total)}</strong>

              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => removeItem(item)}
                disabled={busyId === item.id}
              >
                حذف
              </button>
            </li>
          ))}
        </ul>

        <aside className="summary-card">
          <h3>خلاصه سفارش</h3>
          <div className="summary-row">
            <span>جمع کالاها</span>
            <span>{formatPrice(cart.subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>هزینه ارسال</span>
            <span>{cart.delivery_fee === 0 ? 'رایگان' : formatPrice(cart.delivery_fee)}</span>
          </div>
          {cart.delivery_fee > 0 && (
            <p className="muted small">
              برای ارسال رایگان، {formatPrice(cart.free_delivery_over - cart.subtotal)} دیگر خرید کنید.
            </p>
          )}
          <div className="summary-row total">
            <span>مبلغ قابل پرداخت</span>
            <span>{formatPrice(cart.total)}</span>
          </div>

          {user ? (
            <button type="button" className="btn btn-primary btn-block" onClick={() => navigate('/checkout')}>
              ادامه و تکمیل سفارش
            </button>
          ) : (
            <>
              <div className="alert alert-info">
                برای ثبت سفارش ابتدا وارد حساب کاربری خود شوید.
              </div>
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={() => navigate('/login', { state: { from: '/checkout' } })}
              >
                ورود و ادامه سفارش
              </button>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
