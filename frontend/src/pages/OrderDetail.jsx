import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { formatDateTime, formatPrice, ORDER_STATUS_LABELS, PAYMENT_LABELS } from '../utils.js';

export default function OrderDetail() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [state, setState] = useState({ loading: true, error: '' });

  useEffect(() => {
    let active = true;
    api
      .order(id)
      .then(({ order: found }) => active && setOrder(found))
      .catch((error) => active && setState({ loading: false, error: error.message }))
      .finally(() => active && setState((prev) => ({ ...prev, loading: false })));
    return () => {
      active = false;
    };
  }, [id]);

  if (state.loading) {
    return (
      <div className="container page">
        <p className="muted">در حال بارگذاری…</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container page">
        <div className="alert alert-error">{state.error || 'این سفارش پیدا نشد.'}</div>
        <Link to="/orders" className="btn btn-outline">
          بازگشت به سفارش‌های من
        </Link>
      </div>
    );
  }

  return (
    <div className="container page">
      {location.state?.justPlaced && (
        <div className="alert alert-success">
          سفارش شما با موفقیت ثبت شد. همکاران ما به‌زودی با شما تماس می‌گیرند.
        </div>
      )}

      <nav className="breadcrumb">
        <Link to="/orders">سفارش‌های من</Link>
        <span>/</span>
        <span>سفارش #{order.id}</span>
      </nav>

      <div className="section-head">
        <div>
          <span className="eyebrow">جزئیات سفارش</span>
          <h2>سفارش #{order.id}</h2>
        </div>
        <span className={`status status-${order.status}`}>
          {ORDER_STATUS_LABELS[order.status] || order.status}
        </span>
      </div>

      <div className="checkout-layout">
        <div className="card">
          <h3>اقلام سفارش</h3>
          <ul className="summary-items">
            {order.items.map((item) => (
              <li key={item.id}>
                <span>
                  {item.product_name} × {item.quantity}
                </span>
                <span>{formatPrice(item.line_total)}</span>
              </li>
            ))}
          </ul>
          <div className="summary-row">
            <span>جمع کالاها</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>هزینه ارسال</span>
            <span>{order.delivery_fee === 0 ? 'رایگان' : formatPrice(order.delivery_fee)}</span>
          </div>
          <div className="summary-row total">
            <span>مبلغ کل</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        <aside className="summary-card">
          <h3>اطلاعات تحویل</h3>
          <dl className="detail-list">
            <dt>نام گیرنده</dt>
            <dd>{order.customer_name}</dd>
            <dt>شماره تماس</dt>
            <dd>{order.phone}</dd>
            <dt>نشانی</dt>
            <dd>{order.address}</dd>
            <dt>روش پرداخت</dt>
            <dd>{PAYMENT_LABELS[order.payment_method] || order.payment_method}</dd>
            <dt>زمان ثبت</dt>
            <dd>{formatDateTime(order.created_at)}</dd>
            {order.note && (
              <>
                <dt>توضیحات</dt>
                <dd>{order.note}</dd>
              </>
            )}
          </dl>
        </aside>
      </div>
    </div>
  );
}
