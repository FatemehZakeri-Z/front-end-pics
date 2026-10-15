import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice } from '../utils.js';

export default function ProductCard({ product }) {
  const { add } = useCart();
  const [state, setState] = useState({ status: 'idle', message: '' });

  const handleAdd = async () => {
    setState({ status: 'loading', message: '' });
    try {
      await add(product.id, 1);
      setState({ status: 'done', message: 'به سبد خرید اضافه شد.' });
      setTimeout(() => setState({ status: 'idle', message: '' }), 2500);
    } catch (error) {
      setState({ status: 'error', message: error.message });
    }
  };

  return (
    <article className="product-card">
      <Link to={`/menu/${product.id}`} className="product-media">
        <img src={product.image_url} alt={product.name} loading="lazy" />
        {product.is_popular && <span className="ribbon">محبوب</span>}
        {!product.is_available && <span className="ribbon ribbon-muted">ناموجود</span>}
      </Link>

      <div className="product-body">
        <span className="product-category">{product.category}</span>
        <h3>
          <Link to={`/menu/${product.id}`}>{product.name}</Link>
        </h3>
        <p className="product-desc">{product.description}</p>

        <div className="product-foot">
          <span className="price">{formatPrice(product.price)}</span>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleAdd}
            disabled={state.status === 'loading' || !product.is_available}
          >
            {state.status === 'loading' ? 'در حال افزودن…' : 'افزودن به سبد'}
          </button>
        </div>

        {state.message && (
          <p className={state.status === 'error' ? 'inline-note error' : 'inline-note success'}>
            {state.message}
          </p>
        )}
      </div>
    </article>
  );
}
