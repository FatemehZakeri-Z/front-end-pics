import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { formatDateTime, formatPrice, ORDER_STATUS_LABELS } from '../utils.js';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [state, setState] = useState({ loading: true, error: '' });

  useEffect(() => {
    let active = true;
    api
      .orders()
      .then(({ orders: list }) => active && setOrders(list))
      .catch((error) => active && setState({ loading: false, error: error.message }))
      .finally(() => active && setState((prev) => ({ ...prev, loading: false })));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="container page">
      <div className="section-head">
        <div>
          <span className="eyebrow">حساب من</span>
          <h2>سفارش‌های من</h2>
        </div>
        <Link to="/menu" className="btn btn-outline">
          سفارش جدید
        </Link>
      </div>

      {state.error && <div className="alert alert-error">{state.error}</div>}
      {state.loading ? (
        <p className="muted">در حال بارگذاری…</p>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <h3>هنوز سفارشی ثبت نکرده‌اید</h3>
          <p>اولین سفارش خود را از منو ثبت کنید.</p>
          <Link to="/menu" className="btn btn-primary">
            مشاهده منو
          </Link>
        </div>
      ) : (
        <ul className="order-list">
          {orders.map((order) => (
            <li key={order.id} className="order-card">
              <div className="order-head">
                <div>
                  <strong>سفارش #{order.id}</strong>
                  <span className="muted">{formatDateTime(order.created_at)}</span>
                </div>
                <span className={`status status-${order.status}`}>
                  {ORDER_STATUS_LABELS[order.status] || order.status}
                </span>
              </div>

              <ul className="order-items">
                {order.items.map((item) => (
                  <li key={item.id}>
                    <span>
                      {item.product_name} × {item.quantity}
                    </span>
                    <span>{formatPrice(item.line_total)}</span>
                  </li>
                ))}
              </ul>

              <div className="order-foot">
                <span>مبلغ کل: <strong>{formatPrice(order.total)}</strong></span>
                <Link to={`/orders/${order.id}`} className="btn btn-outline btn-sm">
                  جزئیات سفارش
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
