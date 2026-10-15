import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="container page"><p className="muted">در حال بررسی دسترسی…</p></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="container page">
        <div className="alert alert-error">
          این بخش فقط برای مدیران در دسترس است. با حساب مدیر وارد شوید.
        </div>
      </div>
    );
  }

  return children;
}
