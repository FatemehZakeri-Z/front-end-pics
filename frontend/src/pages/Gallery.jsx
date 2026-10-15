import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

export default function Gallery() {
  const [products, setProducts] = useState([]);
  const [state, setState] = useState({ loading: true, error: '' });

  useEffect(() => {
    let active = true;
    api
      .products()
      .then(({ products: list }) => active && setProducts(list))
      .catch((error) => active && setState({ loading: false, error: error.message }))
      .finally(() => active && setState((prev) => ({ ...prev, loading: false })));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="container page">
      <div className="section-head">
        <div>
          <span className="eyebrow">گالری</span>
          <h2>نگاهی به غذاهای ما</h2>
        </div>
      </div>

      {state.error && <div className="alert alert-error">{state.error}</div>}
      {state.loading ? (
        <p className="muted">در حال بارگذاری…</p>
      ) : products.length === 0 ? (
        <p className="muted">هنوز تصویری برای نمایش نیست.</p>
      ) : (
        <div className="gallery-grid">
          {products.map((product) => (
            <Link key={product.id} to={`/menu/${product.id}`} className="gallery-item">
              <img src={product.image_url} alt={product.name} loading="lazy" />
              <span>{product.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
