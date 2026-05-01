/* eslint-disable no-shadow */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Animated } from 'react-native';
import CartItemRow from '../src/components/cart/CartItemRow';

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

function createItem(overrides = {}) {
  return {
    product: {
      id: 'apple',
      name: 'Apple',
      price: 2.5,
      stock: 8,
      category: 'Fruits',
      ...overrides.product,
    },
    quantity: 2,
    ...overrides,
  };
}

function createProps(overrides = {}) {
  return {
    isOpen: false,
    item: createItem(),
    onCheckout: jest.fn(),
    onClose: jest.fn(),
    onDecrease: jest.fn(),
    onIncrease: jest.fn(),
    onOpen: jest.fn(),
    onRemove: jest.fn(),
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

  return node.children.map(getNodeText).join('');
}

describe('CartItemRow quantity interactions', () => {
  let activeRenderer = null;
  let animatedParallelSpy;
  let animatedSequenceSpy;

  beforeEach(() => {
    animatedParallelSpy = jest.spyOn(Animated, 'parallel');
    animatedSequenceSpy = jest.spyOn(Animated, 'sequence');
  });

  afterEach(() => {
    if (activeRenderer) {
      act(() => {
        activeRenderer.unmount();
      });
      activeRenderer = null;
    }

    animatedParallelSpy.mockRestore();
    animatedSequenceSpy.mockRestore();
  });

  it('keeps the existing quantity handlers wired to the stepper buttons', () => {
    const props = createProps();
    let renderer;

    act(() => {
      renderer = TestRenderer.create(<CartItemRow {...props} />);
    });

    activeRenderer = renderer;

    act(() => {
      renderer.root
        .findByProps({ testID: 'cart-item-decrease-apple' })
        .props.onPress();
      renderer.root
        .findByProps({ testID: 'cart-item-increase-apple' })
        .props.onPress();
    });

    expect(props.onDecrease).toHaveBeenCalledWith('apple');
    expect(props.onIncrease).toHaveBeenCalledWith('apple');
  });

  it('animates the quantity and updates the line total when the quantity changes', () => {
    const props = createProps();
    let renderer;

    act(() => {
      renderer = TestRenderer.create(<CartItemRow {...props} />);
    });

    activeRenderer = renderer;

    expect(
      getNodeText(
        renderer.root.findByProps({ testID: 'cart-item-line-total-apple' }),
      ),
    ).toBe('$5.00');

    act(() => {
      renderer.update(
        <CartItemRow
          {...props}
          item={createItem({
            quantity: 3,
          })}
        />,
      );
    });

    expect(animatedSequenceSpy).toHaveBeenCalled();
    expect(animatedParallelSpy).toHaveBeenCalled();
    expect(
      getNodeText(
        renderer.root.findByProps({ testID: 'cart-item-quantity-value-apple' }),
      ),
    ).toBe('3');
    expect(
      getNodeText(
        renderer.root.findByProps({ testID: 'cart-item-line-total-apple' }),
      ),
    ).toBe('$7.50');
  });
});
