import { useEffect, useState } from 'react';
import { api } from '../../api.js';
import {
  formatDateTime,
  formatPrice,
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  PAYMENT_LABELS,
} from '../../utils.js';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [state, setState] = useState({ loading: true, error: '', notice: '', busyId: null });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    let active = true;
    api.admin
      .orders()
      .then(({ orders: list }) => active && setOrders(list))
      .catch((error) => active && setState((prev) => ({ ...prev, error: error.message })))
      .finally(() => active && setState((prev) => ({ ...prev, loading: false })));
    return () => {
      active = false;
    };
  }, []);

  const changeStatus = async (order, status) => {
    setState((prev) => ({ ...prev, busyId: order.id, error: '', notice: '' }));
    try {
      const { order: updated } = await api.admin.updateOrderStatus(order.id, status);
      setOrders((prev) => prev.map((item) => (item.id === updated.id ? { ...item, status } : item)));
      setState((prev) => ({ ...prev, busyId: null, notice: `وضعیت سفارش #${order.id} به‌روزرسانی شد.` }));
      setTimeout(() => setState((prev) => ({ ...prev, notice: '' })), 3000);
    } catch (error) {
      setState((prev) => ({ ...prev, busyId: null, error: error.message }));
    }
  };

  const visible = filter === 'all' ? orders : orders.filter((order) => order.status === filter);

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h3>سفارش‌ها ({visible.length})</h3>
        <div className="field inline">
          <label htmlFor="status-filter">فیلتر وضعیت</label>
          <select id="status-filter" value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="all">همه</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {ORDER_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {state.notice && <div className="alert alert-success">{state.notice}</div>}
      {state.error && <div className="alert alert-error">{state.error}</div>}

      {state.loading ? (
        <p className="muted">در حال بارگذاری…</p>
      ) : visible.length === 0 ? (
        <div className="empty-state">
          <h3>سفارشی برای نمایش نیست</h3>
        </div>
      ) : (
        <ul className="order-list">
          {visible.map((order) => (
            <li key={order.id} className="order-card">
              <div className="order-head">
                <div>
                  <strong>سفارش #{order.id}</strong>
                  <span className="muted">{formatDateTime(order.created_at)}</span>
                </div>
                <div className="order-head-actions">
                  <span className={`status status-${order.status}`}>
                    {ORDER_STATUS_LABELS[order.status] || order.status}
                  </span>
                  <select
                    value={order.status}
                    disabled={state.busyId === order.id}
                    onChange={(event) => changeStatus(order, event.target.value)}
                    aria-label={`تغییر وضعیت سفارش ${order.id}`}
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {ORDER_STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="order-meta">
                <span>مشتری: {order.customer_name}</span>
                <span>تلفن: {order.phone}</span>
                <span>پرداخت: {PAYMENT_LABELS[order.payment_method] || order.payment_method}</span>
                <span>حساب: {order.user_email || '—'}</span>
              </div>
              <p className="muted small">نشانی: {order.address}</p>

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
                <span>
                  جمع: {formatPrice(order.subtotal)} — ارسال: {formatPrice(order.delivery_fee)}
                </span>
                <strong>{formatPrice(order.total)}</strong>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
