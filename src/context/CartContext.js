import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from 'react';
import { useApp } from './AppContext';
import {
  getStoredCart,
  getUserStorageScope,
  storeCart,
} from '../services/authStorage';

const CartContext = createContext(null);

const initialState = {
  items: [],
};

function normalizeCartQuantity(value, fallback = 1) {
  const parsedValue = Math.floor(Number(value));

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return fallback;
  }

  return parsedValue;
}

function normalizeStoredCartItems(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter(item => item?.product?.id)
    .map(item => ({
      product: item.product,
      quantity: normalizeCartQuantity(item.quantity),
    }));
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE_CART':
      return {
        ...state,
        items: normalizeStoredCartItems(action.payload),
      };
    case 'ADD_TO_CART': {
      const { product, quantity } = action.payload || {};

      if (!product?.id) {
        return state;
      }

      const normalizedQuantity = normalizeCartQuantity(quantity);
      const existingItem = state.items.find(
        item => item.product.id === product.id,
      );

      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.product.id === product.id
              ? {
                  ...item,
                  quantity: item.quantity + normalizedQuantity,
                }
              : item,
          ),
        };
      }

      return {
        ...state,
        items: [...state.items, { product, quantity: normalizedQuantity }],
      };
    }
    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;

      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.product.id !== productId),
        };
      }

      return {
        ...state,
        items: state.items.map(item =>
          item.product.id === productId ? { ...item, quantity } : item,
        ),
      };
    }
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(
          item => item.product.id !== action.payload.productId,
        ),
      };
    case 'CLEAR_CART':
      return initialState;
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const { currentUser } = useApp();
  const storageScope = currentUser?.isPreviewUser
    ? ''
    : getUserStorageScope(currentUser);
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [isStorageHydrated, setIsStorageHydrated] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function restoreCartState() {
      setIsStorageHydrated(false);

      try {
        const storedItems = storageScope ? await getStoredCart(storageScope) : [];

        if (!isActive) {
          return;
        }

        dispatch({
          type: 'HYDRATE_CART',
          payload: storedItems,
        });
      } catch {
        if (!isActive) {
          return;
        }

        dispatch({
          type: 'HYDRATE_CART',
          payload: [],
        });
      } finally {
        if (isActive) {
          setIsStorageHydrated(true);
        }
      }
    }

    restoreCartState();

    return () => {
      isActive = false;
    };
  }, [storageScope]);

  useEffect(() => {
    if (!isStorageHydrated || !storageScope) {
      return;
    }

    storeCart(storageScope, state.items).catch(() => {});
  }, [isStorageHydrated, state.items, storageScope]);

  const subtotal = state.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);

  const value = {
    items: state.items,
    subtotal,
    totalItems,
    addToCart: (product, quantity = 1) =>
      dispatch({
        type: 'ADD_TO_CART',
        payload: { product, quantity },
      }),
    updateQuantity: (productId, quantity) =>
      dispatch({
        type: 'UPDATE_QUANTITY',
        payload: { productId, quantity },
      }),
    increaseQuantity: productId => {
      const item = state.items.find(entry => entry.product.id === productId);

      if (!item) {
        return;
      }

      dispatch({
        type: 'UPDATE_QUANTITY',
        payload: {
          productId,
          quantity: item.quantity + 1,
        },
      });
    },
    decreaseQuantity: productId => {
      const item = state.items.find(entry => entry.product.id === productId);

      if (!item) {
        return;
      }

      dispatch({
        type: 'UPDATE_QUANTITY',
        payload: {
          productId,
          quantity: item.quantity - 1,
        },
      });
    },
    removeFromCart: productId =>
      dispatch({
        type: 'REMOVE_FROM_CART',
        payload: { productId },
      }),
    clearCart: () => dispatch({ type: 'CLEAR_CART' }),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }

  return context;
}
