/* eslint-disable no-shadow */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { LayoutAnimation, Text } from 'react-native';
import CheckoutScreen from '../src/screens/customer/CheckoutScreen';

const mockUseCart = jest.fn();
const mockUseApp = jest.fn();
const mockUseAccountData = jest.fn();
const mockBuildCreateOrderPayload = jest.fn();
const mockSubmitOrder = jest.fn();

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

jest.mock('../src/context/AppContext', () => ({
  useApp: () => mockUseApp(),
}));

jest.mock('../src/context/AccountDataContext', () => ({
  useAccountData: () => mockUseAccountData(),
}));

jest.mock('../src/services/orderService', () => ({
  buildCreateOrderPayload: (...args) => mockBuildCreateOrderPayload(...args),
  submitOrder: (...args) => mockSubmitOrder(...args),
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

jest.mock('../src/components/orders/OrderSuccessModal', () => {
  return function MockOrderSuccessModal({ visible }) {
    const React = require('react');
    const { View } = require('react-native');

    return visible ? <View testID="mock-order-success-modal" /> : null;
  };
});

function createCartItem(overrides = {}) {
  return {
    product: {
      id: 'apple',
      name: 'Apple',
      price: 2.5,
      ...overrides.product,
    },
    quantity: 2,
    ...overrides,
  };
}

function createNavigationMock(overrides = {}) {
  return {
    goBack: jest.fn(),
    navigate: jest.fn(),
    reset: jest.fn(),
    ...overrides,
  };
}

function createCheckoutContext(overrides = {}) {
  const cartItems = overrides.cartItems || [
    createCartItem(),
    createCartItem({
      product: {
        id: 'banana',
        name: 'Banana',
        price: 2.25,
      },
      quantity: 1,
    }),
  ];
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const savedOrder =
    overrides.savedOrder || {
      id: 'order-123',
      totalAmount: subtotal,
      createdAt: '2026-05-01T08:00:00.000Z',
      items: cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      })),
    };

  return {
    addCheckoutOrder: jest.fn(order => order),
    clearCart: jest.fn(),
    currentUser: {
      name: 'Tom',
      phone: '0900000000',
      deliveryAddress: '199 Grovy Street',
    },
    defaultAddress: {
      id: 'address-1',
      label: 'Home',
      recipientName: 'Tom',
      phoneNumber: '0900000000',
      addressLine: '199 Grovy Street',
      area: 'Fresh District',
      fullAddress: '199 Grovy Street, Fresh District',
    },
    defaultPaymentMethod: {
      id: 'cash-1',
      type: 'cash',
      label: 'Cash on Delivery',
    },
    items: cartItems,
    savedOrder,
    subtotal,
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

function findPressableByText(root, text) {
  return root.find(
    node =>
      typeof node.props?.onPress === 'function' &&
      getNodeText(node).includes(text),
  );
}

describe('CheckoutScreen order summary', () => {
  let activeRenderer = null;
  let layoutAnimationSpy;

  beforeEach(() => {
    layoutAnimationSpy = jest
      .spyOn(LayoutAnimation, 'configureNext')
      .mockImplementation(() => {});
    mockUseCart.mockReset();
    mockUseApp.mockReset();
    mockUseAccountData.mockReset();
    mockBuildCreateOrderPayload.mockReset();
    mockSubmitOrder.mockReset();
  });

  afterEach(() => {
    if (activeRenderer) {
      act(() => {
        activeRenderer.unmount();
      });
      activeRenderer = null;
    }

    layoutAnimationSpy.mockRestore();
  });

  function renderScreen(overrides = {}) {
    const context = createCheckoutContext(overrides);
    const navigation = createNavigationMock();

    mockUseCart.mockReturnValue({
      clearCart: context.clearCart,
      items: context.items,
      subtotal: context.subtotal,
    });
    mockUseApp.mockReturnValue({
      currentUser: context.currentUser,
    });
    mockUseAccountData.mockReturnValue({
      addCheckoutOrder: context.addCheckoutOrder,
      defaultAddress: context.defaultAddress,
      defaultPaymentMethod: context.defaultPaymentMethod,
    });

    let renderer;

    act(() => {
      renderer = TestRenderer.create(<CheckoutScreen navigation={navigation} />);
    });

    activeRenderer = renderer;

    return {
      context,
      navigation,
      renderer,
    };
  }

  it('expands and collapses item details while keeping the totals card rendered', () => {
    const { renderer } = renderScreen();

    expect(
      renderer.root.findAllByProps({ testID: 'checkout-order-summary-items' }),
    ).toHaveLength(0);
    expect(
      renderer.root.findAll(node => node.type === Text && getNodeText(node) === 'Subtotal'),
    ).not.toHaveLength(0);

    act(() => {
      renderer.root
        .findByProps({ testID: 'checkout-order-summary-toggle' })
        .props.onPress();
    });

    expect(LayoutAnimation.configureNext).toHaveBeenCalled();
    expect(
      renderer.root.findByProps({ testID: 'checkout-order-summary-items' }),
    ).toBeTruthy();
    expect(
      renderer.root.findByProps({
        testID: 'checkout-order-summary-item-apple',
      }),
    ).toBeTruthy();
    expect(
      renderer.root.findByProps({
        testID: 'checkout-order-summary-item-banana',
      }),
    ).toBeTruthy();

    act(() => {
      renderer.root
        .findByProps({ testID: 'checkout-order-summary-toggle' })
        .props.onPress();
    });

    expect(
      renderer.root.findAllByProps({ testID: 'checkout-order-summary-items' }),
    ).toHaveLength(0);
  });

  it('keeps the place order flow working after toggling the summary card', async () => {
    const orderPayload = { id: 'payload-1' };
    const { context, renderer } = renderScreen();

    mockBuildCreateOrderPayload.mockReturnValue(orderPayload);
    mockSubmitOrder.mockResolvedValue(context.savedOrder);

    act(() => {
      renderer.root
        .findByProps({ testID: 'checkout-order-summary-toggle' })
        .props.onPress();
    });

    await act(async () => {
      findPressableByText(renderer.root, 'Place order').props.onPress();
    });

    expect(mockBuildCreateOrderPayload).toHaveBeenCalledWith({
      address: '199 Grovy Street, Fresh District',
      addressSnapshot: context.defaultAddress,
      cartItems: context.items,
      customerName: 'Tom',
      deliveryFee: 0,
      paymentMethodSnapshot: context.defaultPaymentMethod,
      phone: '0900000000',
      subtotal: context.subtotal,
      totalAmount: context.subtotal,
    });
    expect(mockSubmitOrder).toHaveBeenCalledWith(orderPayload);
    expect(context.addCheckoutOrder).toHaveBeenCalledWith(context.savedOrder);
    expect(context.clearCart).toHaveBeenCalled();
    expect(
      renderer.root.findByProps({ testID: 'mock-order-success-modal' }),
    ).toBeTruthy();
  });
});
