import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import { useApp } from './AppContext';
import {
  getStoredSavedItems,
  getUserStorageScope,
  storeSavedItems,
} from '../services/authStorage';

const FavouriteContext = createContext(null);

const initialState = {
  items: [],
};

function normalizeStoredFavouriteItems(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.filter(item => item?.id);
}

function favouriteReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE_FAVOURITES':
      return {
        ...state,
        items: normalizeStoredFavouriteItems(action.payload),
      };
    case 'ADD_TO_FAVOURITES': {
      const product = action.payload?.product;

      if (!product?.id) {
        return state;
      }

      const alreadyExists = state.items.some(item => item.id === product.id);

      if (alreadyExists) {
        return state;
      }

      return {
        ...state,
        items: [...state.items, product],
      };
    }
    case 'REMOVE_FROM_FAVOURITES':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.productId),
      };
    case 'TOGGLE_FAVOURITE': {
      const product = action.payload?.product;

      if (!product?.id) {
        return state;
      }

      const alreadyExists = state.items.some(item => item.id === product.id);

      if (alreadyExists) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== product.id),
        };
      }

      return {
        ...state,
        items: [...state.items, product],
      };
    }
    case 'CLEAR_FAVOURITES':
      return initialState;
    default:
      return state;
  }
}

export function FavouriteProvider({ children }) {
  const { currentUser } = useApp();
  const storageScope = currentUser?.isPreviewUser
    ? ''
    : getUserStorageScope(currentUser);
  const [state, dispatch] = useReducer(favouriteReducer, initialState);
  const [isStorageHydrated, setIsStorageHydrated] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function restoreFavouriteState() {
      setIsStorageHydrated(false);

      try {
        const storedItems = storageScope
          ? await getStoredSavedItems(storageScope)
          : [];

        if (!isActive) {
          return;
        }

        dispatch({
          type: 'HYDRATE_FAVOURITES',
          payload: storedItems,
        });
      } catch {
        if (!isActive) {
          return;
        }

        dispatch({
          type: 'HYDRATE_FAVOURITES',
          payload: [],
        });
      } finally {
        if (isActive) {
          setIsStorageHydrated(true);
        }
      }
    }

    restoreFavouriteState();

    return () => {
      isActive = false;
    };
  }, [storageScope]);

  useEffect(() => {
    if (!isStorageHydrated || !storageScope) {
      return;
    }

    storeSavedItems(storageScope, state.items).catch(() => {});
  }, [isStorageHydrated, state.items, storageScope]);

  const favouriteIds = useMemo(
    () => new Set(state.items.map(item => item.id)),
    [state.items],
  );

  const value = {
    favourites: state.items,
    totalFavourites: state.items.length,
    addToFavourites: product =>
      dispatch({
        type: 'ADD_TO_FAVOURITES',
        payload: { product },
      }),
    removeFromFavourites: productId =>
      dispatch({
        type: 'REMOVE_FROM_FAVOURITES',
        payload: { productId },
      }),
    toggleFavourite: product =>
      dispatch({
        type: 'TOGGLE_FAVOURITE',
        payload: { product },
      }),
    isFavourite: productId => favouriteIds.has(productId),
    clearFavourites: () => dispatch({ type: 'CLEAR_FAVOURITES' }),
  };

  return (
    <FavouriteContext.Provider value={value}>
      {children}
    </FavouriteContext.Provider>
  );
}

export function useFavourite() {
  const context = useContext(FavouriteContext);

  if (!context) {
    throw new Error('useFavourite must be used inside FavouriteProvider');
  }

  return context;
}
