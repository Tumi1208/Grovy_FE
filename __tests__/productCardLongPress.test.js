import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import ProductCard from '../src/components/ProductCard';
import HomeProductCard from '../src/components/home/HomeProductCard';

jest.mock('../src/components/ProductImage', () => {
  return function MockProductImage() {
    const { View } = require('react-native');

    return <View />;
  };
});

jest.mock('../src/components/ScalePressable', () => {
  return function MockScalePressable({ children, style, testID, ...props }) {
    const { Pressable } = require('react-native');
    const resolvedTestId = testID || (props.onLongPress ? 'card-root' : undefined);

    return (
      <Pressable
        {...props}
        style={typeof style === 'function' ? style({ pressed: false }) : style}
        testID={resolvedTestId}
      >
        {typeof children === 'function'
          ? children({ pressed: false })
          : children}
      </Pressable>
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
    imageKey: 'apple',
    ...overrides,
  };
}

describe('product card long press behavior', () => {
  function renderProductCard(overrides = {}) {
    const onPress = jest.fn();
    const onLongPress = jest.fn();
    let renderer;

    act(() => {
      renderer = TestRenderer.create(
        <ProductCard
          onLongPress={onLongPress}
          onPress={onPress}
          product={createProduct(overrides)}
        />,
      );
    });

    return { onLongPress, onPress, renderer };
  }

  function renderHomeProductCard(overrides = {}) {
    const onPress = jest.fn();
    const onLongPress = jest.fn();
    let renderer;

    act(() => {
      renderer = TestRenderer.create(
        <HomeProductCard
          imageSource={1}
          onLongPress={onLongPress}
          onPress={onPress}
          product={createProduct(overrides)}
        />,
      );
    });

    return { onLongPress, onPress, renderer };
  }

  it('keeps normal press navigation for ProductCard but suppresses it after long press', () => {
    const { onLongPress, onPress, renderer } = renderProductCard();
    const rootPressable = renderer.root.findByProps({ testID: 'card-root' });

    act(() => {
      rootPressable.props.onPress();
    });

    expect(onPress).toHaveBeenCalledWith(createProduct());

    act(() => {
      rootPressable.props.onLongPress();
      rootPressable.props.onPress();
    });

    expect(onLongPress).toHaveBeenCalledWith(createProduct());
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('keeps normal press navigation for HomeProductCard but suppresses it after long press', () => {
    const { onLongPress, onPress, renderer } = renderHomeProductCard();
    const rootPressable = renderer.root.findByProps({ testID: 'card-root' });

    act(() => {
      rootPressable.props.onPress();
    });

    expect(onPress).toHaveBeenCalledWith(createProduct());

    act(() => {
      rootPressable.props.onLongPress();
      rootPressable.props.onPress();
    });

    expect(onLongPress).toHaveBeenCalledWith(createProduct());
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
