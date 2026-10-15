import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { pool, initSchema } from './db.js';
import { seed } from './seed.js';
import authRouter from './routes/auth.js';
import productsRouter from './routes/products.js';
import cartRouter from './routes/cart.js';
import ordersRouter from './routes/orders.js';
import adminRouter from './routes/admin.js';

const app = express();
const port = Number(process.env.PORT || 8000);

// The preview is served through an HTTPS proxy, so trust its forwarded headers.
app.set('trust proxy', 1);
app.use(express.json());

const PgStore = connectPgSimple(session);
app.use(
  session({
    store: new PgStore({ pool, tableName: 'session', createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET || 'laghme-laziz-dev-secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 30,
    },
  })
);

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/admin', adminRouter);

app.use('/api', (req, res) => res.status(404).json({ error: 'مسیر مورد نظر یافت نشد.' }));

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'خطای داخلی سرور. لطفاً دوباره تلاش کنید.' });
});

async function start() {
  await initSchema();
  await seed();
  app.listen(port, '0.0.0.0', () => {
    console.log(`لقمه‌لذیذ API listening on http://0.0.0.0:${port}`);
  });
}

start().catch((error) => {
  console.error('API failed to start:', error);
  process.exit(1);
});
