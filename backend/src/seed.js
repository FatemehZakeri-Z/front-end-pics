import bcrypt from 'bcryptjs';
import { query } from './db.js';

const IMG = 'https://images.unsplash.com';

export const SEED_PRODUCTS = [
  {
    name: 'پیتزا مارگاریتا',
    description: 'خمیر تازه، پنیر موزارلا، سس گوجه گیلاسی و کمی ریحان تازه.',
    price: 285000,
    category: 'پیتزا',
    image_url: `${IMG}/photo-1513104890138-7c749659a591?w=800&q=80&auto=format&fit=crop`,
    is_popular: true,
  },
  {
    name: 'پیتزا پپرونی',
    description: 'پپرونی تند، پنیر چدار و سس مخصوص سرآشپز روی خمیر نازک.',
    price: 320000,
    category: 'پیتزا',
    image_url: `${IMG}/photo-1628840042765-356cda07504e?w=800&q=80&auto=format&fit=crop`,
    is_popular: false,
  },
  {
    name: 'برگر دوگانه لقمه‌لذیذ',
    description: 'دو ورقه گوشت گریل، پنیر ورقه‌ای، کاهو، گوجه و سس مخصوص.',
    price: 265000,
    category: 'برگر',
    image_url: `${IMG}/photo-1568901346375-23c9450c58cd?w=800&q=80&auto=format&fit=crop`,
    is_popular: true,
  },
  {
    name: 'برگر مرغ سوخاری',
    description: 'فیله مرغ سوخاری ترد با سس سیر و نان برگر تازه.',
    price: 220000,
    category: 'برگر',
    image_url: `${IMG}/photo-1606755962773-d324e0a13086?w=800&q=80&auto=format&fit=crop`,
    is_popular: false,
  },
  {
    name: 'سیب‌زمینی سرخ‌کرده',
    description: 'سیب‌زمینی تازه با طعم ادویه مخصوص و سس چدار.',
    price: 120000,
    category: 'پیش‌غذا',
    image_url: `${IMG}/photo-1573080496219-bb080dd4f877?w=800&q=80&auto=format&fit=crop`,
    is_popular: true,
  },
  {
    name: 'بال سوخاری',
    description: 'شش عدد بال مرغ سوخاری با سس تند و سیر.',
    price: 195000,
    category: 'پیش‌غذا',
    image_url: `${IMG}/photo-1626645738196-c2a7c87a8f58?w=800&q=80&auto=format&fit=crop`,
    is_popular: false,
  },
  {
    name: 'ساندویچ فیله مرغ',
    description: 'فیله گریل شده با قارچ، پنیر و نان باگت تازه.',
    price: 210000,
    category: 'ساندویچ',
    image_url: `${IMG}/photo-1528735602780-2552fd46c7af?w=800&q=80&auto=format&fit=crop`,
    is_popular: false,
  },
  {
    name: 'کباب کوبیده',
    description: 'دو سیخ کباب کوبیده گوشت گوسفندی با برنج ایرانی و کره.',
    price: 380000,
    category: 'غذای اصلی',
    image_url: `${IMG}/photo-1603360946369-dc9bb6258143?w=800&q=80&auto=format&fit=crop`,
    is_popular: true,
  },
  {
    name: 'پاستا آلفردو',
    description: 'پاستا فتوچینی با سس خامه‌ای آلفردو، قارچ و مرغ گریل.',
    price: 245000,
    category: 'غذای اصلی',
    image_url: `${IMG}/photo-1551183053-bf91a1d81141?w=800&q=80&auto=format&fit=crop`,
    is_popular: false,
  },
  {
    name: 'سالاد سزار',
    description: 'کاهو رومی، نان تست، پنیر پارمزان و سس سزار خانگی.',
    price: 155000,
    category: 'سالاد',
    image_url: `${IMG}/photo-1512621776951-a57141f2eefd?w=800&q=80&auto=format&fit=crop`,
    is_popular: false,
  },
  {
    name: 'میلک‌شیک شکلات',
    description: 'میلک‌شیک شکلاتی غلیظ با بستنی وانیلی و خامه.',
    price: 135000,
    category: 'نوشیدنی',
    image_url: `${IMG}/photo-1572490122747-3968b75cc699?w=800&q=80&auto=format&fit=crop`,
    is_popular: true,
  },
  {
    name: 'دونات شکلاتی',
    description: 'دونات تازه با روکش شکلات تلخ و خلال پسته.',
    price: 95000,
    category: 'دسر',
    image_url: `${IMG}/photo-1551024506-0bccd828d307?w=800&q=80&auto=format&fit=crop`,
    is_popular: false,
  },
];

export async function seed() {
  const { rows } = await query('SELECT COUNT(*)::int AS count FROM products');
  if (rows[0].count === 0) {
    for (const product of SEED_PRODUCTS) {
      await query(
        `INSERT INTO products (name, description, price, category, image_url, is_popular)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          product.name,
          product.description,
          product.price,
          product.category,
          product.image_url,
          product.is_popular,
        ]
      );
    }
    console.log(`Seeded ${SEED_PRODUCTS.length} products.`);
  }

  const admin = await query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
  if (admin.rowCount === 0) {
    const email = (process.env.ADMIN_EMAIL || 'admin@laghme.ir').toLowerCase();
    const password = process.env.ADMIN_PASSWORD || 'admin1234';
    const hash = await bcrypt.hash(password, 10);
    await query(
      "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'admin') ON CONFLICT (email) DO NOTHING",
      ['مدیر لقمه‌لذیذ', email, hash]
    );
    console.log(`Seeded admin account: ${email}`);
  }

  const demoEmail = (process.env.DEMO_EMAIL || 'demo@laghme.ir').toLowerCase();
  const demo = await query('SELECT id FROM users WHERE email = $1', [demoEmail]);
  if (demo.rowCount === 0) {
    const demoHash = await bcrypt.hash(process.env.DEMO_PASSWORD || 'demo1234', 10);
    await query(
      "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'customer') ON CONFLICT (email) DO NOTHING",
      ['کاربر نمونه', demoEmail, demoHash]
    );
    console.log(`Seeded demo customer: ${demoEmail}`);
  }
}
