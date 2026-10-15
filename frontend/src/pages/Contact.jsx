import { Link } from 'react-router-dom';

export default function Contact() {
  return (
    <div className="container page">
      <div className="section-head">
        <div>
          <span className="eyebrow">تماس با ما</span>
          <h2>در خدمت شما هستیم</h2>
        </div>
      </div>

      <div className="cards-3">
        <div className="card">
          <h3>نشانی</h3>
          <p className="muted">تهران، خیابان ولیعصر، پلاک ۱۲۳، طبقه همکف</p>
        </div>
        <div className="card">
          <h3>تلفن</h3>
          <p className="muted">۰۲۱-۱۲۳۴۵۶۷۸</p>
          <p className="muted">۰۹۱۲۳۴۵۶۷۸۹</p>
        </div>
        <div className="card">
          <h3>ساعت کاری</h3>
          <p className="muted">هر روز از ۱۱:۰۰ تا ۲۳:۳۰</p>
        </div>
      </div>

      <div className="card prose-card">
        <h3>سفارش و پیگیری</h3>
        <p className="muted">
          سفارش‌ها به‌صورت آنلاین از همین سایت ثبت می‌شوند. پس از ثبت سفارش می‌توانید وضعیت آن را
          در بخش «سفارش‌های من» ببینید. برای پیگیری تلفنی هم می‌توانید با شماره بالا تماس بگیرید.
        </p>
        <Link to="/menu" className="btn btn-primary">
          ثبت سفارش
        </Link>
      </div>
    </div>
  );
}
