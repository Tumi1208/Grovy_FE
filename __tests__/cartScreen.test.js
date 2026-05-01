/* eslint-disable no-shadow */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Alert, LayoutAnimation } from 'react-native';
import CartScreen from '../src/screens/customer/CartScreen';

const mockUseCart = jest.fn();
const mockUseFavourite = jest.fn();

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }) => {
    const React = require('react');
    const { View } = require('react-native');

    return <View>{children}</View>;
  },
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

jest.mock('../src/components/cart/CartHealthCard', () => () => null);

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

jest.mock('../src/components/cart/CartItemRow', () => {
  return function MockCartItemRow({
    item,
    onDecrease,
    onIncrease,
    onRemove,
    onSaveForLater,
  }) {
    const React = require('react');
    const { Pressable, Text, View } = require('react-native');

    return (
      <View testID={`mock-cart-row-${item.product.id}`}>
        <Pressable
          onPress={() => onSaveForLater(item.product)}
          testID={`mock-save-${item.product.id}`}
        >
          <Text>Save</Text>
        </Pressable>
        <Pressable
          onPress={() => onRemove(item.product.id)}
          testID={`mock-delete-${item.product.id}`}
        >
          <Text>Delete</Text>
        </Pressable>
        <Pressable
          onPress={() => onDecrease(item.product.id)}
          testID={`mock-decrease-${item.product.id}`}
        >
          <Text>Decrease</Text>
        </Pressable>
        <Pressable
          onPress={() => onIncrease(item.product.id)}
          testID={`mock-increase-${item.product.id}`}
        >
          <Text>Increase</Text>
        </Pressable>
      </View>
    );
  };
});

function createCartItem(overrides = {}) {
  return {
    product: {
      id: 'apple',
      name: 'Apple',
      price: 2.5,
      stock: 8,
      category: 'Fruit',
      ...overrides.product,
    },
    quantity: 2,
    ...overrides,
  };
}

function createCartState(overrides = {}) {
  return {
    decreaseQuantity: jest.fn(),
    increaseQuantity: jest.fn(),
    items: [createCartItem()],
    removeFromCart: jest.fn(),
    subtotal: 5,
    totalItems: 2,
    ...overrides,
  };
}

function createFavouriteState(overrides = {}) {
  return {
    addToFavourites: jest.fn(),
    isFavourite: jest.fn(() => false),
    ...overrides,
  };
}

describe('CartScreen swipe action wiring', () => {
  const navigation = {
    navigate: jest.fn(),
  };

  let alertSpy;
  let layoutAnimationSpy;

  beforeEach(() => {
    navigation.navigate.mockReset();
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    layoutAnimationSpy = jest
      .spyOn(LayoutAnimation, 'configureNext')
      .mockImplementation(() => {});
  });

  afterEach(() => {
    alertSpy.mockRestore();
    layoutAnimationSpy.mockRestore();
    mockUseCart.mockReset();
    mockUseFavourite.mockReset();
  });

  function renderScreen() {
    let renderer;

    act(() => {
      renderer = TestRenderer.create(<CartScreen navigation={navigation} />);
    });

    return renderer;
  }

  it('adds the item to favourites when Save is pressed', () => {
    const cartState = createCartState();
    const favouriteState = createFavouriteState();

    mockUseCart.mockImplementation(() => cartState);
    mockUseFavourite.mockImplementation(() => favouriteState);

    const renderer = renderScreen();

    act(() => {
      renderer.root.findByProps({ testID: 'mock-save-apple' }).props.onPress();
    });

    expect(favouriteState.isFavourite).toHaveBeenCalledWith('apple');
    expect(favouriteState.addToFavourites).toHaveBeenCalledWith(
      cartState.items[0].product,
    );
    expect(Alert.alert).toHaveBeenCalledWith(
      'Saved for later',
      'Apple was added to your saved items.',
    );
  });

  it('shows an existing-saved message instead of adding a duplicate favourite', () => {
    const cartState = createCartState();
    const favouriteState = createFavouriteState({
      isFavourite: jest.fn(() => true),
    });

    mockUseCart.mockImplementation(() => cartState);
    mockUseFavourite.mockImplementation(() => favouriteState);

    const renderer = renderScreen();

    act(() => {
      renderer.root.findByProps({ testID: 'mock-save-apple' }).props.onPress();
    });

    expect(favouriteState.addToFavourites).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith(
      'Already saved',
      'Apple is already in your saved items.',
    );
  });

  it('reuses existing delete and quantity handlers', () => {
    const cartState = createCartState();
    const favouriteState = createFavouriteState();

    mockUseCart.mockImplementation(() => cartState);
    mockUseFavourite.mockImplementation(() => favouriteState);

    const renderer = renderScreen();

    act(() => {
      renderer.root
        .findByProps({ testID: 'mock-delete-apple' })
        .props.onPress();
      renderer.root
        .findByProps({ testID: 'mock-decrease-apple' })
        .props.onPress();
      renderer.root
        .findByProps({ testID: 'mock-increase-apple' })
        .props.onPress();
    });

    expect(LayoutAnimation.configureNext).toHaveBeenCalled();
    expect(cartState.removeFromCart).toHaveBeenCalledWith('apple');
    expect(cartState.decreaseQuantity).toHaveBeenCalledWith('apple');
    expect(cartState.increaseQuantity).toHaveBeenCalledWith('apple');
  });
});
