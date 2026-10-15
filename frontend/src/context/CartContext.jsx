import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';

const CartContext = createContext(null);
const EMPTY_CART = { items: [], count: 0, subtotal: 0, delivery_fee: 0, total: 0 };

export function CartProvider({ children }) {
  const [cart, setCart] = useState(EMPTY_CART);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await api.cart();
    setCart(data);
    return data;
  }, []);

  useEffect(() => {
    refresh()
      .catch(() => setCart(EMPTY_CART))
      .finally(() => setLoading(false));
  }, [refresh]);

  const add = useCallback(async (productId, quantity = 1) => {
    setCart(await api.addToCart(productId, quantity));
  }, []);

  const updateQuantity = useCallback(async (itemId, quantity) => {
    setCart(await api.updateCartItem(itemId, quantity));
  }, []);

  const remove = useCallback(async (itemId) => {
    setCart(await api.removeCartItem(itemId));
  }, []);

  const clear = useCallback(async () => {
    setCart(await api.clearCart());
  }, []);

  const value = useMemo(
    () => ({ cart, loading, refresh, add, updateQuantity, remove, clear }),
    [cart, loading, refresh, add, updateQuantity, remove, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}
