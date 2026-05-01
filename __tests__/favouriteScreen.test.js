/* eslint-disable no-shadow */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { LayoutAnimation } from 'react-native';
import FavouriteScreen from '../src/screens/customer/FavouriteScreen';
import { CUSTOMER_ROUTES } from '../src/constants/routes';

const mockUseCart = jest.fn();
const mockUseFavourite = jest.fn();

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }) => {
    const React = require('react');
    const { View } = require('react-native');

    return <View>{children}</View>;
  },
  useSafeAreaInsets: () => ({ bottom: 0 }),
}));

jest.mock('../src/context/CartContext', () => ({
  useCart: () => mockUseCart(),
}));

jest.mock('../src/context/FavouriteContext', () => ({
  useFavourite: () => mockUseFavourite(),
}));

jest.mock('../src/components/ProductImage', () => {
  return function MockProductImage() {
    const React = require('react');
    const { View } = require('react-native');

    return <View />;
  };
});

jest.mock('../src/components/ScalePressable', () => {
  return function MockScalePressable({ children, style, ...props }) {
    const React = require('react');
    const { Pressable } = require('react-native');

    return (
      <Pressable
        {...props}
        style={typeof style === 'function' ? style({ pressed: false }) : style}
      >
        {typeof children === 'function'
          ? children({ pressed: false })
          : children}
      </Pressable>
    );
  };
});

jest.mock('../src/components/favourites/FavouriteItemRow', () => {
  return function MockFavouriteItemRow({
    onAddToCart,
    onPress,
    onRemove,
    product,
  }) {
    const React = require('react');
    const { Pressable, Text, View } = require('react-native');

    return (
      <View testID={`mock-favourite-row-${product.id}`}>
        <Pressable
          onPress={() => onPress(product)}
          testID={`mock-open-${product.id}`}
        >
          <Text>Open</Text>
        </Pressable>
        <Pressable
          onPress={() => onAddToCart(product)}
          testID={`mock-add-${product.id}`}
        >
          <Text>Add</Text>
        </Pressable>
        <Pressable
          onPress={() => onRemove(product.id)}
          testID={`mock-remove-${product.id}`}
        >
          <Text>Remove</Text>
        </Pressable>
      </View>
    );
  };
});

function createProduct(overrides = {}) {
  return {
    id: 'apple',
    name: 'Apple',
    price: 2.5,
    stock: 8,
    category: 'Fruit',
    ...overrides,
  };
}

function createCartState(overrides = {}) {
  return {
    addToCart: jest.fn(),
    ...overrides,
  };
}

function createFavouriteState(overrides = {}) {
  return {
    addToFavourites: jest.fn(),
    favourites: [createProduct()],
    removeFromFavourites: jest.fn(),
    ...overrides,
  };
}

describe('FavouriteScreen swipe action wiring', () => {
  const navigation = {
    navigate: jest.fn(),
  };

  let activeRenderer = null;
  let layoutAnimationSpy;

  beforeEach(() => {
    jest.useFakeTimers();
    navigation.navigate.mockReset();
    layoutAnimationSpy = jest
      .spyOn(LayoutAnimation, 'configureNext')
      .mockImplementation(() => {});
  });

  afterEach(() => {
    if (activeRenderer) {
      act(() => {
        activeRenderer.unmount();
      });
      activeRenderer = null;
    }

    layoutAnimationSpy.mockRestore();
    jest.clearAllTimers();
    jest.useRealTimers();
    mockUseCart.mockReset();
    mockUseFavourite.mockReset();
  });

  function renderScreen() {
    let renderer;

    act(() => {
      renderer = TestRenderer.create(
        <FavouriteScreen navigation={navigation} />,
      );
    });

    activeRenderer = renderer;
    return renderer;
  }

  it('adds the saved item to cart and keeps it in favourites', () => {
    const cartState = createCartState();
    const favouriteState = createFavouriteState();

    mockUseCart.mockImplementation(() => cartState);
    mockUseFavourite.mockImplementation(() => favouriteState);

    const renderer = renderScreen();

    act(() => {
      renderer.root.findByProps({ testID: 'mock-add-apple' }).props.onPress();
    });

    expect(cartState.addToCart).toHaveBeenCalledWith(
      favouriteState.favourites[0],
      1,
    );
    expect(favouriteState.removeFromFavourites).not.toHaveBeenCalled();
    expect(
      renderer.root.findByProps({ testID: 'favourite-feedback-toast' }),
    ).toBeTruthy();
  });

  it('reuses the existing remove handler with row removal animation', () => {
    const cartState = createCartState();
    const favouriteState = createFavouriteState();

    mockUseCart.mockImplementation(() => cartState);
    mockUseFavourite.mockImplementation(() => favouriteState);

    const renderer = renderScreen();

    act(() => {
      renderer.root
        .findByProps({ testID: 'mock-remove-apple' })
        .props.onPress();
    });

    expect(LayoutAnimation.configureNext).toHaveBeenCalled();
    expect(favouriteState.removeFromFavourites).toHaveBeenCalledWith('apple');
    expect(
      renderer.root.findByProps({ testID: 'favourite-feedback-toast' }),
    ).toBeTruthy();

    act(() => {
      renderer.root
        .findByProps({ testID: 'favourite-feedback-toast-action' })
        .props.onPress();
    });

    expect(favouriteState.addToFavourites).toHaveBeenCalledWith(
      favouriteState.favourites[0],
    );
  });

  it('keeps product detail navigation on row press', () => {
    const cartState = createCartState();
    const favouriteState = createFavouriteState();

    mockUseCart.mockImplementation(() => cartState);
    mockUseFavourite.mockImplementation(() => favouriteState);

    const renderer = renderScreen();

    act(() => {
      renderer.root.findByProps({ testID: 'mock-open-apple' }).props.onPress();
    });

    expect(navigation.navigate).toHaveBeenCalledWith(
      CUSTOMER_ROUTES.PRODUCT_DETAIL,
      {
        productId: 'apple',
        initialProduct: favouriteState.favourites[0],
      },
    );
  });
});
