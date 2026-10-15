import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import ProductCard from '../components/ProductCard.jsx';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1000&q=80&auto=format&fit=crop';
const CTA_IMAGE =
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&q=80&auto=format&fit=crop';

const TRUST = [
  { icon: '🌿', title: 'مواد اولیه تازه', text: 'هر روز از بازار محلی' },
  { icon: '🛵', title: 'ارسال سریع', text: 'کمتر از ۴۵ دقیقه' },
  { icon: '🧼', title: 'بهداشت و ایمنی', text: 'آشپزخانه استاندارد' },
];

export default function Home() {
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .products({ popular: 'true' })
      .then(({ products }) => active && setPopular(products))
      .catch(() => active && setPopular([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="eyebrow light">تازه • خوشمزه • لذیذ</span>
            <h1>
              غذای خانگی با <span className="accent">عشق</span> پخته می‌شود
            </h1>
            <p>
              از پیتزای پنیری تا برگر آبدار، بهترین غذا را با مواد اولیه تازه و کلی عشق سرو می‌کنیم.
            </p>
            <div className="hero-actions">
              <Link to="/menu" className="btn btn-primary">
                سفارش دهید ←
              </Link>
              <Link to="/menu" className="btn btn-outline-light">
                مشاهده منو
              </Link>
            </div>
          </div>

          <div className="hero-media">
            <img src={HERO_IMAGE} alt="برگر مخصوص لقمه‌لذیذ" />
          </div>
        </div>
      </section>

      <section className="trust-strip">
        <div className="container trust-row">
          {TRUST.map((item) => (
            <div key={item.title} className="trust-item">
              <span className="trust-icon" aria-hidden="true">{item.icon}</span>
              <div>
                <strong>{item.title}</strong>
                <span>{item.text}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">پیشنهاد ویژه</span>
              <h2>منوی محبوب</h2>
            </div>
            <Link to="/menu" className="btn btn-outline">
              مشاهده منوی کامل ←
            </Link>
          </div>

          {loading ? (
            <p className="muted">در حال بارگذاری منو…</p>
          ) : popular.length === 0 ? (
            <p className="muted">هنوز محصولی ثبت نشده است.</p>
          ) : (
            <div className="product-grid">
              {popular.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="cta-band">
        <div className="container cta-inner">
          <div className="cta-copy">
            <span className="eyebrow light">غذای خوب همیشه</span>
            <h2>هوس کرده‌اید؟ برایتان می‌آوریم!</h2>
            <p>
              همین حالا غذای مورد علاقه‌تان را سفارش دهید و ترکیب بی‌نقص طعم و تازگی را تجربه کنید.
            </p>
            <Link to="/menu" className="btn btn-primary">
              سفارش دهید ←
            </Link>
          </div>
          <img src={CTA_IMAGE} alt="پیتزای تازه" className="cta-image" />
        </div>
      </section>
    </>
  );
}
