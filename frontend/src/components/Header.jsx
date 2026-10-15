import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

const NAV_ITEMS = [
  { to: '/', label: 'خانه' },
  { to: '/menu', label: 'منو' },
  { to: '/about', label: 'درباره ما' },
  { to: '/gallery', label: 'گالری' },
  { to: '/contact', label: 'تماس با ما' },
];

export default function Header() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const { cart } = useCart();

  const submitSearch = (event) => {
    event.preventDefault();
    navigate(`/menu?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand">
          <span className="brand-title">لقمه‌لذیذ</span>
          <span className="brand-sub">غذای خوب • حال خوب</span>
        </Link>

        <nav className="main-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              پنل مدیریت
            </NavLink>
          )}
        </nav>

        <div className="header-actions">
          <form className="search-form" onSubmit={submitSearch} role="search">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="جستجوی غذا..."
              aria-label="جستجوی غذا"
            />
            <button type="submit" className="icon-btn" aria-label="جستجو">
              ⌕
            </button>
          </form>

          <Link to="/cart" className="cart-link" aria-label="سبد خرید">
            <span className="cart-icon" aria-hidden="true">🛒</span>
            {cart.count > 0 && <span className="cart-badge">{cart.count}</span>}
          </Link>

          {user ? (
            <div className="user-menu">
              <Link to="/orders" className="user-name">{user.name}</Link>
              <button type="button" className="btn btn-ghost btn-sm" onClick={logout}>
                خروج
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-ghost btn-sm">
              ورود
            </Link>
          )}

          <Link to="/menu" className="btn btn-primary btn-sm">
            سفارش دهید ←
          </Link>
        </div>
      </div>
    </header>
  );
}
