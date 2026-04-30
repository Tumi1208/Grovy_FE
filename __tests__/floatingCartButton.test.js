import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import FloatingCartButton from '../src/components/cart/FloatingCartButton';
import { CUSTOMER_ROUTES } from '../src/constants/routes';

const mockUseCart = jest.fn();

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 0 }),
}));

jest.mock('../src/context/CartContext', () => ({
  useCart: () => mockUseCart(),
}));

function createCartState(overrides = {}) {
  return {
    isStorageHydrated: true,
    items: [],
    subtotal: 0,
    totalItems: 0,
    ...overrides,
  };
}

function createCartItem({ id, price, quantity }) {
  return {
    product: {
      id,
      price,
    },
    quantity,
  };
}

function findAllByTestId(root, testID) {
  return root.findAll(
    node => node.props?.testID === testID && typeof node.type === 'string',
  );
}

describe('FloatingCartButton', () => {
  const navigation = {
    navigate: jest.fn(),
  };
  let currentCartState;

  beforeEach(() => {
    jest.useFakeTimers();
    navigation.navigate.mockReset();
    currentCartState = createCartState();
    mockUseCart.mockImplementation(() => currentCartState);
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    mockUseCart.mockReset();
  });

  function renderButton(routeName = CUSTOMER_ROUTES.HOME) {
    let renderer;

    act(() => {
      renderer = TestRenderer.create(
        <FloatingCartButton
          cartRouteName={CUSTOMER_ROUTES.CART}
          currentRouteName={routeName}
          navigation={navigation}
        />,
      );
    });

    return renderer;
  }

  function updateCart(renderer, nextState, routeName = CUSTOMER_ROUTES.HOME) {
    currentCartState = createCartState(nextState);

    act(() => {
      renderer.update(
        <FloatingCartButton
          cartRouteName={CUSTOMER_ROUTES.CART}
          currentRouteName={routeName}
          navigation={navigation}
        />,
      );
    });
  }

  it('hides completely for an empty cart', () => {
    const renderer = renderButton();

    expect(findAllByTestId(renderer.root, 'floating-cart-button')).toHaveLength(0);
  });

  it('stays collapsed after cart hydration restores saved items', () => {
    currentCartState = createCartState({
      isStorageHydrated: false,
    });

    const renderer = renderButton();

    updateCart(renderer, {
      isStorageHydrated: true,
      items: [createCartItem({ id: 'apple', price: 2.5, quantity: 1 })],
      subtotal: 2.5,
      totalItems: 1,
    });

    expect(findAllByTestId(renderer.root, 'floating-cart-button')).toHaveLength(1);
    expect(findAllByTestId(renderer.root, 'floating-cart-collapsed')).toHaveLength(1);
    expect(findAllByTestId(renderer.root, 'floating-cart-expanded')).toHaveLength(0);
  });

  it('expands after a cart update and auto-collapses after 3 seconds', () => {
    currentCartState = createCartState({
      items: [createCartItem({ id: 'apple', price: 2.5, quantity: 1 })],
      subtotal: 2.5,
      totalItems: 1,
    });

    const renderer = renderButton();

    updateCart(renderer, {
      items: [createCartItem({ id: 'apple', price: 2.5, quantity: 2 })],
      subtotal: 5,
      totalItems: 2,
    });

    expect(findAllByTestId(renderer.root, 'floating-cart-expanded')).toHaveLength(1);

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(findAllByTestId(renderer.root, 'floating-cart-collapsed')).toHaveLength(1);
    expect(findAllByTestId(renderer.root, 'floating-cart-expanded')).toHaveLength(0);
  });

  it('resets the collapse timer when another cart change happens', () => {
    currentCartState = createCartState({
      items: [createCartItem({ id: 'apple', price: 2.5, quantity: 1 })],
      subtotal: 2.5,
      totalItems: 1,
    });

    const renderer = renderButton();

    updateCart(renderer, {
      items: [createCartItem({ id: 'apple', price: 2.5, quantity: 2 })],
      subtotal: 5,
      totalItems: 2,
    });

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    updateCart(renderer, {
      items: [createCartItem({ id: 'apple', price: 2.5, quantity: 3 })],
      subtotal: 7.5,
      totalItems: 3,
    });

    act(() => {
      jest.advanceTimersByTime(1500);
    });

    expect(findAllByTestId(renderer.root, 'floating-cart-expanded')).toHaveLength(1);

    act(() => {
      jest.advanceTimersByTime(1500);
    });

    expect(findAllByTestId(renderer.root, 'floating-cart-collapsed')).toHaveLength(1);
  });

  it('navigates to the existing cart route when pressed', () => {
    currentCartState = createCartState({
      items: [createCartItem({ id: 'apple', price: 2.5, quantity: 1 })],
      subtotal: 2.5,
      totalItems: 1,
    });

    const renderer = renderButton();

    act(() => {
      renderer.root.findByProps({ testID: 'floating-cart-button' }).props.onPress();
    });

    expect(navigation.navigate).toHaveBeenCalledWith(CUSTOMER_ROUTES.CART);
  });
});
