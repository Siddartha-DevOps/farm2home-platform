// frontend/src/context/CartContext.jsx
import { createContext, useContext, useReducer, useEffect } from 'react';
import { cartAPI } from '../services/api';

const CartContext = createContext(null);

const initialState = {
  items: [],
  totalAmount: 0,
  itemCount: 0,
  loading: false,
  error: null,
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_CART':
      return {
        ...state,
        items: action.payload.items || [],
        totalAmount: action.payload.totalAmount || 0,
        itemCount: (action.payload.items || []).reduce((sum, i) => sum + i.quantity, 0),
        loading: false,
        error: null,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_CART':
      return { ...initialState };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const fetchCart = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await cartAPI.getCart();
      dispatch({ type: 'SET_CART', payload: res.data.data });
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load cart' });
    }
  };

  // Fetch cart on mount if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) fetchCart();
  }, []);

  const addToCart = async (productId, quantity = 1) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await cartAPI.addItem(productId, quantity);
      dispatch({ type: 'SET_CART', payload: res.data.data });
      return { success: true };
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message || 'Failed to add item' });
      return { success: false, message: err.response?.data?.message };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const res = await cartAPI.updateItem(productId, quantity);
      dispatch({ type: 'SET_CART', payload: res.data.data });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message });
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const res = await cartAPI.removeItem(productId);
      dispatch({ type: 'SET_CART', payload: res.data.data });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message });
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clearCart();
      dispatch({ type: 'CLEAR_CART' });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message });
    }
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
