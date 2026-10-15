import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const { refresh } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setErrors({});
    try {
      await register(form);
      await refresh();
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setErrors(err.fieldErrors || {});
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container page narrow">
      <div className="card form-card">
        <h2>ثبت‌نام</h2>
        <p className="muted">برای ثبت سفارش و پیگیری آن یک حساب کاربری بسازید.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="name">نام و نام خانوادگی</label>
            <input
              id="name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>
          <div className="field">
            <label htmlFor="email">ایمیل</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              autoComplete="email"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          <div className="field">
            <label htmlFor="password">رمز عبور</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              autoComplete="new-password"
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'در حال ثبت‌نام…' : 'ساخت حساب'}
          </button>
        </form>

        <p className="muted small">
          قبلاً ثبت‌نام کرده‌اید؟ <Link to="/login">ورود</Link>
        </p>
      </div>
    </div>
  );
}
