import { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { formatPrice } from '../../utils.js';

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  category: '',
  image_url: '',
  is_popular: false,
  is_available: true,
};

function toForm(product) {
  return {
    name: product.name,
    description: product.description,
    price: String(product.price),
    category: product.category,
    image_url: product.image_url,
    is_popular: product.is_popular,
    is_available: product.is_available,
  };
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState({});
  const [pendingDelete, setPendingDelete] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { products: list } = await api.admin.products();
      setProducts(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (product) => {
    setEditingId(product.id);
    setForm(toForm(product));
    setErrors({});
    setShowForm(true);
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    setError('');
    const payload = {
      ...form,
      price: Number(String(form.price).replace(/[^\d]/g, '')),
    };
    try {
      if (editingId) {
        const { product } = await api.admin.updateProduct(editingId, payload);
        setProducts((prev) => prev.map((item) => (item.id === product.id ? product : item)));
        setNotice('محصول با موفقیت ویرایش شد.');
      } else {
        const { product } = await api.admin.createProduct(payload);
        setProducts((prev) => [product, ...prev]);
        setNotice('محصول جدید اضافه شد.');
      }
      setShowForm(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
      setTimeout(() => setNotice(''), 3000);
    } catch (err) {
      setErrors(err.fieldErrors || {});
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (product) => {
    setError('');
    try {
      await api.admin.deleteProduct(product.id);
      setProducts((prev) => prev.filter((item) => item.id !== product.id));
      setPendingDelete(null);
      setNotice('محصول حذف شد.');
      setTimeout(() => setNotice(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleAvailable = async (product) => {
    setError('');
    try {
      const { product: updated } = await api.admin.updateProduct(product.id, {
        is_available: !product.is_available,
      });
      setProducts((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h3>محصولات ({products.length})</h3>
        <button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>
          + افزودن محصول
        </button>
      </div>

      {notice && <div className="alert alert-success">{notice}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <form className="card form-card admin-form" onSubmit={save} noValidate>
          <h4>{editingId ? `ویرایش محصول #${editingId}` : 'محصول جدید'}</h4>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="p-name">نام محصول</label>
              <input
                id="p-name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="field">
              <label htmlFor="p-category">دسته‌بندی</label>
              <input
                id="p-category"
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
              />
              {errors.category && <span className="error-text">{errors.category}</span>}
            </div>

            <div className="field">
              <label htmlFor="p-price">قیمت (تومان)</label>
              <input
                id="p-price"
                value={form.price}
                onChange={(event) => setForm({ ...form, price: event.target.value })}
                inputMode="numeric"
              />
              {errors.price && <span className="error-text">{errors.price}</span>}
            </div>

            <div className="field">
              <label htmlFor="p-image">نشانی تصویر</label>
              <input
                id="p-image"
                value={form.image_url}
                onChange={(event) => setForm({ ...form, image_url: event.target.value })}
                placeholder="https://…"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="p-desc">توضیحات</label>
            <textarea
              id="p-desc"
              rows="2"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </div>

          <div className="check-row">
            <label className="check">
              <input
                type="checkbox"
                checked={form.is_popular}
                onChange={(event) => setForm({ ...form, is_popular: event.target.checked })}
              />
              نمایش در منوی محبوب
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={form.is_available}
                onChange={(event) => setForm({ ...form, is_available: event.target.checked })}
              />
              موجود است
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'در حال ذخیره…' : 'ذخیره'}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setErrors({});
              }}
            >
              انصراف
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="muted">در حال بارگذاری…</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>محصول</th>
                <th>دسته</th>
                <th>قیمت</th>
                <th>وضعیت</th>
                <th>محبوب</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>
                    <div className="table-product">
                      <img src={product.image_url} alt="" />
                      <span>{product.name}</span>
                    </div>
                  </td>
                  <td>{product.category}</td>
                  <td>{formatPrice(product.price)}</td>
                  <td>
                    <button
                      type="button"
                      className={product.is_available ? 'pill pill-ok' : 'pill pill-off'}
                      onClick={() => toggleAvailable(product)}
                    >
                      {product.is_available ? 'موجود' : 'ناموجود'}
                    </button>
                  </td>
                  <td>{product.is_popular ? '✓' : '—'}</td>
                  <td>
                    {pendingDelete === product.id ? (
                      <div className="row-actions">
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => remove(product)}>
                          تأیید حذف
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setPendingDelete(null)}
                        >
                          انصراف
                        </button>
                      </div>
                    ) : (
                      <div className="row-actions">
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => openEdit(product)}
                        >
                          ویرایش
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setPendingDelete(product.id)}
                        >
                          حذف
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
