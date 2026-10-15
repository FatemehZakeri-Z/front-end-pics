import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice } from '../utils.js';

const PHONE_RE = /^09\d{9}$/;

function normalizeDigits(value) {
  const fa = '۰۱۲۳۴۵۶۷۸۹';
  const ar = '٠١٢٣٤٥٦٧٨٩';
  return String(value)
    .split('')
    .map((char) => {
      const i = fa.indexOf(char);
      if (i > -1) return String(i);
      const j = ar.indexOf(char);
      if (j > -1) return String(j);
      return char;
    })
    .join('');
}

export default function Checkout() {
  const { cart, refresh } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customer_name: user?.name || '',
    phone: '',
    address: '',
    note: '',
    payment_method: 'cash',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (form.customer_name.trim().length < 3) next.customer_name = 'نام و نام خانوادگی را کامل وارد کنید.';
    const phone = normalizeDigits(form.phone.replace(/[\s-]/g, ''));
    if (!PHONE_RE.test(phone)) next.phone = 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.';
    if (form.address.trim().length < 10) next.address = 'نشانی را کامل‌تر وارد کنید (حداقل ۱۰ کاراکتر).';
    return next;
  };

  const submit = async (event) => {
    event.preventDefault();
    const clientErrors = validate();
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});
    try {
      const { order } = await api.checkout({
        ...form,
        phone: normalizeDigits(form.phone.replace(/[\s-]/g, '')),
      });
      await refresh();
      navigate(`/orders/${order.id}`, { state: { justPlaced: true } });
    } catch (error) {
      setErrors(error.fieldErrors || {});
      setErrors((prev) => ({ ...prev, form: error.message }));
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="container page">
        <div className="empty-state">
          <h2>سبد خرید شما خالی است</h2>
          <p>برای تکمیل سفارش، ابتدا غذایی به سبد اضافه کنید.</p>
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
          <span className="eyebrow">تکمیل سفارش</span>
          <h2>اطلاعات تحویل</h2>
        </div>
      </div>

      <div className="checkout-layout">
        <form className="card form-card" onSubmit={submit} noValidate>
          {errors.form && <div className="alert alert-error">{errors.form}</div>}

          <div className="field">
            <label htmlFor="customer_name">نام و نام خانوادگی</label>
            <input
              id="customer_name"
              value={form.customer_name}
              onChange={(event) => update('customer_name', event.target.value)}
              placeholder="مثلاً فاطمه ذاکری"
            />
            {errors.customer_name && <span className="error-text">{errors.customer_name}</span>}
          </div>

          <div className="field">
            <label htmlFor="phone">شماره موبایل</label>
            <input
              id="phone"
              value={form.phone}
              onChange={(event) => update('phone', event.target.value)}
              placeholder="۰۹۱۲۳۴۵۶۷۸۹"
              inputMode="numeric"
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>

          <div className="field">
            <label htmlFor="address">نشانی کامل</label>
            <textarea
              id="address"
              rows="3"
              value={form.address}
              onChange={(event) => update('address', event.target.value)}
              placeholder="خیابان، کوچه، پلاک و واحد"
            />
            {errors.address && <span className="error-text">{errors.address}</span>}
          </div>

          <div className="field">
            <label htmlFor="note">توضیحات سفارش (اختیاری)</label>
            <textarea
              id="note"
              rows="2"
              value={form.note}
              onChange={(event) => update('note', event.target.value)}
              placeholder="مثلاً بدون پیاز، زنگ نزنید…"
            />
          </div>

          <fieldset className="field">
            <legend>روش پرداخت</legend>
            <label className="radio-row">
              <input
                type="radio"
                name="payment_method"
                value="cash"
                checked={form.payment_method === 'cash'}
                onChange={(event) => update('payment_method', event.target.value)}
              />
              پرداخت در محل
            </label>
            <label className="radio-row">
              <input
                type="radio"
                name="payment_method"
                value="online"
                checked={form.payment_method === 'online'}
                onChange={(event) => update('payment_method', event.target.value)}
              />
              پرداخت آنلاین
            </label>
          </fieldset>

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'در حال ثبت سفارش…' : 'ثبت نهایی سفارش'}
          </button>
        </form>

        <aside className="summary-card">
          <h3>سفارش شما</h3>
          <ul className="summary-items">
            {cart.items.map((item) => (
              <li key={item.id}>
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>{formatPrice(item.line_total)}</span>
              </li>
            ))}
          </ul>
          <div className="summary-row">
            <span>جمع کالاها</span>
            <span>{formatPrice(cart.subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>هزینه ارسال</span>
            <span>{cart.delivery_fee === 0 ? 'رایگان' : formatPrice(cart.delivery_fee)}</span>
          </div>
          <div className="summary-row total">
            <span>مبلغ قابل پرداخت</span>
            <span>{formatPrice(cart.total)}</span>
          </div>
          {form.payment_method === 'online' && (
            <p className="muted small">
              پرداخت آنلاین هنوز به درگاه بانکی متصل نشده است؛ سفارش با روش «پرداخت در محل» ثبت و
              پیگیری می‌شود.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
