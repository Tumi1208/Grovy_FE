/* eslint-disable no-shadow */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { LayoutAnimation } from 'react-native';
import CartScreen from '../src/screens/customer/CartScreen';
import { CUSTOMER_ROUTES } from '../src/constants/routes';

const mockUseCart = jest.fn();

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
    onCheckout,
    item,
    onDecrease,
    onIncrease,
    onRemove,
  }) {
    const React = require('react');
    const { Pressable, Text, View } = require('react-native');

    return (
      <View testID={`mock-cart-row-${item.product.id}`}>
        <Pressable
          onPress={() => onCheckout()}
          testID={`mock-checkout-${item.product.id}`}
        >
          <Text>Checkout</Text>
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
    addToCart: jest.fn(),
    decreaseQuantity: jest.fn(),
    increaseQuantity: jest.fn(),
    items: [createCartItem()],
    removeFromCart: jest.fn(),
    subtotal: 5,
    totalItems: 2,
    ...overrides,
  };
}

function getNodeText(node) {
  if (typeof node === 'string') {
    return node;
  }

  if (!node || !node.children) {
    return '';
  }

  return node.children.map(getNodeText).join(' ');
}

function findClosestPressableForText(root, text) {
  const matchingTextNodes = root.findAll(
    node => node.type === 'Text' && getNodeText(node) === text,
  );
  const matchingPressables = matchingTextNodes
    .map(node => {
      let currentNode = node.parent;

      while (currentNode) {
        if (typeof currentNode.props?.onPress === 'function') {
          return currentNode;
        }

        currentNode = currentNode.parent;
      }

      return null;
    })
    .filter(Boolean);

  if (!matchingPressables.length) {
    throw new Error(`Could not find pressable for text: ${text}`);
  }

  return matchingPressables[0];
}

describe('CartScreen swipe action wiring', () => {
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
  });

  function renderScreen() {
    let renderer;

    act(() => {
      renderer = TestRenderer.create(<CartScreen navigation={navigation} />);
    });

    activeRenderer = renderer;
    return renderer;
  }

  it('reuses the existing checkout navigation when Checkout is pressed', () => {
    const cartState = createCartState();

    mockUseCart.mockImplementation(() => cartState);

    const renderer = renderScreen();

    act(() => {
      renderer.root
        .findByProps({ testID: 'mock-checkout-apple' })
        .props.onPress();
    });

    expect(navigation.navigate).toHaveBeenCalledWith(CUSTOMER_ROUTES.CHECKOUT);
  });

  it('removes the item, shows undo, and restores it when Undo is pressed', () => {
    const cartState = createCartState();

    mockUseCart.mockImplementation(() => cartState);

    const renderer = renderScreen();

    act(() => {
      renderer.root
        .findByProps({ testID: 'mock-delete-apple' })
        .props.onPress();
    });

    expect(LayoutAnimation.configureNext).toHaveBeenCalled();
    expect(cartState.removeFromCart).toHaveBeenCalledWith('apple');
    expect(renderer.root.findByProps({ testID: 'cart-feedback-toast' })).toBeTruthy();

    act(() => {
      renderer.root
        .findByProps({ testID: 'cart-feedback-toast-action' })
        .props.onPress();
    });

    expect(cartState.addToCart).toHaveBeenCalledWith(cartState.items[0].product, 2);
  });

  it('reuses existing quantity handlers', () => {
    const cartState = createCartState();

    mockUseCart.mockImplementation(() => cartState);

    const renderer = renderScreen();

    act(() => {
      renderer.root
        .findByProps({ testID: 'mock-decrease-apple' })
        .props.onPress();
      renderer.root
        .findByProps({ testID: 'mock-increase-apple' })
        .props.onPress();
    });

    expect(cartState.decreaseQuantity).toHaveBeenCalledWith('apple');
    expect(cartState.increaseQuantity).toHaveBeenCalledWith('apple');
  });

  it('keeps row removal smooth when decreasing the final quantity', () => {
    const cartState = createCartState({
      items: [createCartItem({ quantity: 1 })],
      subtotal: 2.5,
      totalItems: 1,
    });

    mockUseCart.mockImplementation(() => cartState);

    const renderer = renderScreen();

    layoutAnimationSpy.mockClear();

    act(() => {
      renderer.root
        .findByProps({ testID: 'mock-decrease-apple' })
        .props.onPress();
    });

    expect(LayoutAnimation.configureNext).toHaveBeenCalled();
    expect(cartState.decreaseQuantity).toHaveBeenCalledWith('apple');
  });

  it('routes empty carts back to smart baskets on Home', () => {
    const cartState = createCartState({
      items: [],
      subtotal: 0,
      totalItems: 0,
    });

    mockUseCart.mockImplementation(() => cartState);

    const renderer = renderScreen();

    act(() => {
      findClosestPressableForText(
        renderer.root,
        'Browse Smart Baskets',
      ).props.onPress();
    });

    expect(navigation.navigate).toHaveBeenCalledWith(CUSTOMER_ROUTES.HOME);
  });
});
