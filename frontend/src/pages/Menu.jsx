import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import ProductCard from '../components/ProductCard.jsx';

const SORTS = [
  { value: 'popular', label: 'محبوب‌ترین' },
  { value: 'price_asc', label: 'ارزان‌ترین' },
  { value: 'price_desc', label: 'گران‌ترین' },
  { value: 'newest', label: 'جدیدترین' },
  { value: 'name', label: 'الفبایی' },
];

export default function Menu() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'all';
  const sort = searchParams.get('sort') || 'popular';

  useEffect(() => {
    api
      .categories()
      .then(({ categories: list }) => setCategories(list))
      .catch(() => setCategories([]));
  }, []);

  const requestId = useRef(0);

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError('');
    try {
      const { products: list } = await api.products({ q: query, category, sort });
      // A slower earlier request must not overwrite the results of a newer one.
      if (id !== requestId.current) return;
      setProducts(list);
    } catch (err) {
      if (id !== requestId.current) return;
      setError(err.message);
      setProducts([]);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [query, category, sort]);

  useEffect(() => {
    load();
  }, [load]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'all') next.delete(key);
    else next.set(key, value);
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="container page">
      <div className="section-head">
        <div>
          <span className="eyebrow">منوی لقمه‌لذیذ</span>
          <h2>همه غذاها</h2>
        </div>
        <span className="muted">{products.length} مورد</span>
      </div>

      <div className="toolbar">
        <div className="field">
          <label htmlFor="menu-search">جستجو</label>
          <input
            id="menu-search"
            type="search"
            value={query}
            placeholder="نام غذا یا مواد اولیه…"
            onChange={(event) => updateParam('q', event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="menu-sort">ترتیب</label>
          <select id="menu-sort" value={sort} onChange={(event) => updateParam('sort', event.target.value)}>
            {SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="chip-row">
        <button
          type="button"
          className={category === 'all' ? 'chip active' : 'chip'}
          onClick={() => updateParam('category', 'all')}
        >
          همه
        </button>
        {categories.map((item) => (
          <button
            key={item.category}
            type="button"
            className={category === item.category ? 'chip active' : 'chip'}
            onClick={() => updateParam('category', item.category)}
          >
            {item.category} ({item.count})
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p className="muted">در حال بارگذاری…</p>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <h3>غذایی با این مشخصات پیدا نشد</h3>
          <p>عبارت جستجو یا دسته‌بندی را تغییر دهید.</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
