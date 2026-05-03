import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Animated } from 'react-native';
import FavouriteItemRow from '../src/components/favourites/FavouriteItemRow';

jest.mock('../src/components/ProductImage', () => {
  return function MockProductImage() {
    const ReactLib = require('react');
    const { View } = require('react-native');

    return ReactLib.createElement(View);
  };
});

jest.mock('../src/components/DirectionalHint', () => {
  return function MockDirectionalHint() {
    const ReactLib = require('react');
    const { View } = require('react-native');

    return ReactLib.createElement(View);
  };
});

jest.mock('../src/components/ScalePressable', () => {
  return function MockScalePressable({ children, style, ...props }) {
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

function createProps(overrides = {}) {
  return {
    isOpen: false,
    onAddToCart: jest.fn(),
    onClose: jest.fn(),
    onOpen: jest.fn(),
    onPress: jest.fn(),
    onRemove: jest.fn(),
    product: createProduct(),
    ...overrides,
  };
}

describe('FavouriteItemRow actions', () => {
  let activeRenderer = null;
  let animatedSpringSpy;

  beforeEach(() => {
    animatedSpringSpy = jest.spyOn(Animated, 'spring').mockImplementation(() => ({
      start: callback => callback?.({ finished: true }),
    }));
  });

  afterEach(() => {
    if (activeRenderer) {
      act(() => {
        activeRenderer.unmount();
      });
      activeRenderer = null;
    }

    animatedSpringSpy.mockRestore();
  });

  it('uses the same add handler for the visible quick add button', () => {
    const props = createProps();
    let renderer;

    act(() => {
      renderer = TestRenderer.create(<FavouriteItemRow {...props} />);
    });

    activeRenderer = renderer;

    act(() => {
      renderer.root
        .findByProps({ testID: 'favourite-item-quick-add-apple' })
        .props.onPress();
    });

    expect(props.onAddToCart).toHaveBeenCalledWith(props.product);
  });

  it('keeps the swipe action buttons wired to add and remove handlers', () => {
    const props = createProps({ isOpen: true });
    let renderer;

    act(() => {
      renderer = TestRenderer.create(<FavouriteItemRow {...props} />);
    });

    activeRenderer = renderer;

    act(() => {
      renderer.root
        .findByProps({ testID: 'favourite-item-add-action-apple' })
        .props.onPress();
      renderer.root
        .findByProps({ testID: 'favourite-item-remove-action-apple' })
        .props.onPress();
    });

    expect(props.onAddToCart).toHaveBeenCalledWith(props.product);
    expect(props.onRemove).toHaveBeenCalledWith('apple');
  });
});
