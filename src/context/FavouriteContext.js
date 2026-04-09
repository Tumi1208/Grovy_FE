import React, { createContext, useContext, useMemo, useReducer } from 'react';

const FavouriteContext = createContext(null);

const initialState = {
  items: [],
};

function favouriteReducer(state, action) {
  switch (action.type) {
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
  const [state, dispatch] = useReducer(favouriteReducer, initialState);

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
