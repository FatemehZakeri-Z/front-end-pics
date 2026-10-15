import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice } from '../utils.js';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [state, setState] = useState({ loading: true, error: '', note: '' });

  useEffect(() => {
    let active = true;
    setState({ loading: true, error: '', note: '' });
    api
      .product(id)
      .then(({ product: found }) => active && setProduct(found))
      .catch((error) => active && setState({ loading: false, error: error.message, note: '' }))
      .finally(() => active && setState((prev) => ({ ...prev, loading: false })));
    return () => {
      active = false;
    };
  }, [id]);

  const handleAdd = async () => {
    try {
      await add(product.id, quantity);
      setState((prev) => ({ ...prev, note: 'به سبد خرید اضافه شد.' }));
      setTimeout(() => setState((prev) => ({ ...prev, note: '' })), 2500);
    } catch (error) {
      setState((prev) => ({ ...prev, error: error.message }));
    }
  };

  if (state.loading) {
    return (
      <div className="container page">
        <p className="muted">در حال بارگذاری…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container page">
        <div className="alert alert-error">{state.error || 'این محصول پیدا نشد.'}</div>
        <Link to="/menu" className="btn btn-outline">
          بازگشت به منو
        </Link>
      </div>
    );
  }

  return (
    <div className="container page">
      <nav className="breadcrumb">
        <Link to="/menu">منو</Link>
        <span>/</span>
        <span>{product.category}</span>
      </nav>

      <div className="detail-layout">
        <div className="detail-media">
          <img src={product.image_url} alt={product.name} />
        </div>

        <div className="detail-body">
          <span className="product-category">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="detail-desc">{product.description}</p>
          <span className="price price-lg">{formatPrice(product.price)}</span>

          {product.is_available ? (
            <>
              <div className="qty-row">
                <span>تعداد</span>
                <div className="qty">
                  <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="کاهش">
                    −
                  </button>
                  <span>{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                    aria-label="افزایش"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="detail-actions">
                <button type="button" className="btn btn-primary" onClick={handleAdd}>
                  افزودن به سبد خرید
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    handleAdd();
                    navigate('/cart');
                  }}
                >
                  خرید و رفتن به سبد
                </button>
              </div>
            </>
          ) : (
            <div className="alert alert-error">این محصول در حال حاضر موجود نیست.</div>
          )}

          {state.note && <p className="inline-note success">{state.note}</p>}
          {state.error && <p className="inline-note error">{state.error}</p>}
        </div>
      </div>
    </div>
  );
}
