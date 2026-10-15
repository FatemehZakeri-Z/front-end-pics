import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const { refresh } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await login(form);
      await refresh();
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container page narrow">
      <div className="card form-card">
        <h2>ورود به حساب</h2>
        <p className="muted">برای ثبت سفارش و مشاهده سابقه سفارش‌ها وارد شوید.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="email">ایمیل</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label htmlFor="password">رمز عبور</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'در حال ورود…' : 'ورود'}
          </button>
        </form>

        <p className="muted small">
          حساب کاربری ندارید؟ <Link to="/register">ثبت‌نام کنید</Link>
        </p>
      </div>
    </div>
  );
}
