const BASE = '/api';

async function request(path, options = {}) {
  const response = await fetch(BASE + path, {
    credentials: 'include',
    method: options.method || 'GET',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const error = new Error((data && data.error) || 'ارتباط با سرور برقرار نشد.');
    error.status = response.status;
    error.fieldErrors = (data && data.errors) || {};
    throw error;
  }
  return data;
}

export const api = {
  me: () => request('/auth/me'),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  register: (body) => request('/auth/register', { method: 'POST', body }),
  logout: () => request('/auth/logout', { method: 'POST' }),

  products: (params = {}) => {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') search.set(key, value);
    });
    const qs = search.toString();
    return request(`/products${qs ? `?${qs}` : ''}`);
  },
  product: (id) => request(`/products/${id}`),
  categories: () => request('/products/categories'),

  cart: () => request('/cart'),
  addToCart: (product_id, quantity = 1) =>
    request('/cart/items', { method: 'POST', body: { product_id, quantity } }),
  updateCartItem: (id, quantity) =>
    request(`/cart/items/${id}`, { method: 'PATCH', body: { quantity } }),
  removeCartItem: (id) => request(`/cart/items/${id}`, { method: 'DELETE' }),
  clearCart: () => request('/cart', { method: 'DELETE' }),

  checkout: (body) => request('/orders', { method: 'POST', body }),
  orders: () => request('/orders'),
  order: (id) => request(`/orders/${id}`),

  admin: {
    stats: () => request('/admin/stats'),
    products: () => request('/admin/products'),
    createProduct: (body) => request('/admin/products', { method: 'POST', body }),
    updateProduct: (id, body) => request(`/admin/products/${id}`, { method: 'PATCH', body }),
    deleteProduct: (id) => request(`/admin/products/${id}`, { method: 'DELETE' }),
    orders: () => request('/admin/orders'),
    updateOrderStatus: (id, status) =>
      request(`/admin/orders/${id}`, { method: 'PATCH', body: { status } }),
  },
};
