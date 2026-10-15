import { Link } from 'react-router-dom';

const BADGES = [
  { title: '۱۰۰٪ مواد اولیه تازه', icon: '🌿' },
  { title: 'محبوب مشتریان', icon: '⭐' },
  { title: 'ارسال سریع و مطمئن', icon: '🚚' },
  { title: 'پرداخت امن', icon: '🔒' },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-badges">
          {BADGES.map((badge) => (
            <div key={badge.title} className="footer-badge">
              <span aria-hidden="true">{badge.icon}</span>
              <span>{badge.title}</span>
            </div>
          ))}
        </div>

        <div className="footer-main">
          <div>
            <span className="brand-title">لقمه‌لذیذ</span>
            <p className="footer-text">
              از پیتزای پنیری تا برگر آبدار، بهترین غذا را با مواد اولیه تازه و کلی عشق سرو می‌کنیم.
            </p>
          </div>

          <div className="footer-col">
            <h4>دسترسی سریع</h4>
            <Link to="/menu">منو</Link>
            <Link to="/cart">سبد خرید</Link>
            <Link to="/orders">سفارش‌های من</Link>
            <Link to="/contact">تماس با ما</Link>
          </div>

          <div className="footer-col">
            <h4>ساعت کاری</h4>
            <span>هر روز از ۱۱:۰۰ تا ۲۳:۳۰</span>
            <span>ارسال به سراسر شهر</span>
            <span>۰۲۱-۱۲۳۴۵۶۷۸</span>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© ۲۰۲۵ لقمه‌لذیذ. تمامی حقوق محفوظ است.</span>
          <div className="footer-social">
            <span aria-hidden="true">📘</span>
            <span aria-hidden="true">📸</span>
            <span aria-hidden="true">📌</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
