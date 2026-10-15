import { Link } from 'react-router-dom';

const VALUES = [
  { icon: '🌿', title: 'مواد اولیه تازه', text: 'هر روز صبح از بازار محلی خرید می‌کنیم؛ هیچ‌چیز فریزری نیست.' },
  { icon: '👩‍🍳', title: 'آشپزخانه خانگی', text: 'غذاها با دستور‌های خانگی و بدون مواد نگهدارنده پخته می‌شوند.' },
  { icon: '🛵', title: 'ارسال سریع', text: 'سفارش‌ها با پیک اختصاصی و در بسته‌بندی گرم‌نگهدار ارسال می‌شوند.' },
];

export default function About() {
  return (
    <div className="container page">
      <div className="section-head">
        <div>
          <span className="eyebrow">درباره ما</span>
          <h2>داستان لقمه‌لذیذ</h2>
        </div>
      </div>

      <div className="card prose-card">
        <p>
          لقمه‌لذیذ از یک آشپزخانه کوچک و یک علاقه بزرگ شروع شد: اینکه غذای ساده و باکیفیت باید
          در دسترس همه باشد. امروز هر روز برای صدها خانواده غذا می‌پزیم و هنوز همان اصل را رعایت
          می‌کنیم — مواد تازه، پخت روزانه و طعمی که یاد خانه را زنده می‌کند.
        </p>
      </div>

      <div className="cards-3">
        {VALUES.map((value) => (
          <div key={value.title} className="card">
            <span className="trust-icon" aria-hidden="true">{value.icon}</span>
            <h3>{value.title}</h3>
            <p className="muted">{value.text}</p>
          </div>
        ))}
      </div>

      <div className="center-actions">
        <Link to="/menu" className="btn btn-primary">
          مشاهده منو
        </Link>
      </div>
    </div>
  );
}
