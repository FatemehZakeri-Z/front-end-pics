import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container page">
      <div className="empty-state">
        <h2>صفحه مورد نظر پیدا نشد</h2>
        <p>ممکن است نشانی اشتباه وارد شده باشد.</p>
        <Link to="/" className="btn btn-primary">
          بازگشت به خانه
        </Link>
      </div>
    </div>
  );
}
