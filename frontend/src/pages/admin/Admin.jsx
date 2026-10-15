import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { api } from '../../api.js';
import { formatNumber, formatPrice } from '../../utils.js';

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.admin
      .stats()
      .then(({ stats: data }) => active && setStats(data))
      .catch((err) => active && setError(err.message));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="container page">
      <div className="section-head">
        <div>
          <span className="eyebrow">پنل مدیریت</span>
          <h2>مدیریت لقمه‌لذیذ</h2>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <span>تعداد محصولات</span>
            <strong>{formatNumber(stats.products)}</strong>
          </div>
          <div className="stat-card">
            <span>کل سفارش‌ها</span>
            <strong>{formatNumber(stats.orders)}</strong>
          </div>
          <div className="stat-card">
            <span>در انتظار تأیید</span>
            <strong>{formatNumber(stats.pending_orders)}</strong>
          </div>
          <div className="stat-card">
            <span>مشتریان</span>
            <strong>{formatNumber(stats.customers)}</strong>
          </div>
          <div className="stat-card">
            <span>مجموع فروش</span>
            <strong>{formatPrice(stats.revenue)}</strong>
          </div>
        </div>
      )}

      <nav className="admin-tabs">
        <NavLink to="/admin/products" className={({ isActive }) => (isActive ? 'tab active' : 'tab')}>
          محصولات
        </NavLink>
        <NavLink to="/admin/orders" className={({ isActive }) => (isActive ? 'tab active' : 'tab')}>
          سفارش‌ها
        </NavLink>
      </nav>

      <Outlet />
    </div>
  );
}
