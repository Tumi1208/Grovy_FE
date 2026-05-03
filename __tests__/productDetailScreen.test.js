import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import ProductDetailScreen from '../src/screens/customer/ProductDetailScreen';
import { CUSTOMER_ROUTES } from '../src/constants/routes';

const mockUseCart = jest.fn();
const mockUseFavourite = jest.fn();
const mockGetProductDetailById = jest.fn();

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }) => {
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

jest.mock('../src/services/productService', () => ({
  getProductDetailById: (...args) => mockGetProductDetailById(...args),
}));

jest.mock('../src/components/ProductImage', () => {
  return function MockProductImage() {
    const { View } = require('react-native');

    return <View />;
  };
});

jest.mock('../src/components/DirectionalHint', () => {
  return function MockDirectionalHint() {
    const { View } = require('react-native');

    return <View />;
  };
});

jest.mock('../src/components/icons/ChevronIcon', () => {
  return function MockChevronIcon() {
    const { View } = require('react-native');

    return <View />;
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
    id: 'grovy-eggs-red-001',
    name: 'Brown Eggs Tray',
    price: 4.9,
    stock: 6,
    category: 'Dairy and Eggs',
    description: 'Farm brown eggs for breakfast, baking, and fridge restocks.',
    unit: '1 tray',
    size: '12 pcs',
    imageKey: 'eggsRedChick',
    ...overrides,
  };
}

describe('ProductDetailScreen sticky CTA and quantity flow', () => {
  const navigation = {
    canGoBack: jest.fn(() => true),
    goBack: jest.fn(),
    navigate: jest.fn(),
  };
  const product = createProduct();
  let activeRenderer = null;
  let currentCartState;

  beforeEach(() => {
    jest.useFakeTimers();
    navigation.canGoBack.mockReset();
    navigation.canGoBack.mockReturnValue(true);
    navigation.goBack.mockReset();
    navigation.navigate.mockReset();
    mockGetProductDetailById.mockResolvedValue(product);
    currentCartState = {
      addToCart: jest.fn(),
      totalItems: 0,
    };
    mockUseCart.mockReturnValue(currentCartState);
    mockUseFavourite.mockReturnValue({
      isFavourite: jest.fn(() => false),
      toggleFavourite: jest.fn(),
    });
  });

  afterEach(() => {
    if (activeRenderer) {
      act(() => {
        activeRenderer.unmount();
      });
      activeRenderer = null;
    }

    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
    mockUseCart.mockReset();
    mockUseFavourite.mockReset();
    mockGetProductDetailById.mockReset();
  });

  async function renderScreen() {
    await act(async () => {
      activeRenderer = TestRenderer.create(
        <ProductDetailScreen
          navigation={navigation}
          route={{
            params: {
              initialProduct: product,
              productId: product.id,
            },
          }}
        />,
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    act(() => {
      jest.runOnlyPendingTimers();
    });

    return activeRenderer;
  }

  it('renders the selected product and keeps the quantity default at one', async () => {
    const renderer = await renderScreen();

    expect(
      renderer.root.findByProps({ testID: 'product-detail-quantity-value' })
        .props.children,
    ).toBe(1);
    expect(
      renderer.root.findByProps({ testID: 'product-detail-add-to-cart-label' })
        .props.children,
    ).toBe('Add 1 to Cart · $4.90');
  });

  it('updates the sticky CTA total and reuses the existing add to cart logic', async () => {
    const renderer = await renderScreen();

    act(() => {
      renderer.root
        .findByProps({ testID: 'product-detail-quantity-increase' })
        .props.onPress();
    });

    expect(
      renderer.root.findByProps({ testID: 'product-detail-add-to-cart-label' })
        .props.children,
    ).toBe('Add 2 to Cart · $9.80');

    act(() => {
      renderer.root
        .findByProps({ testID: 'product-detail-add-to-cart' })
        .props.onPress();
    });

    expect(currentCartState.addToCart).toHaveBeenCalledWith(product, 2);
    expect(navigation.navigate).toHaveBeenCalledWith(CUSTOMER_ROUTES.CART);
  });

  it('keeps the back button wired to the current navigation stack', async () => {
    const renderer = await renderScreen();

    act(() => {
      renderer.root
        .findByProps({ testID: 'product-detail-back' })
        .props.onPress();
    });

    expect(navigation.goBack).toHaveBeenCalled();
    expect(navigation.navigate).not.toHaveBeenCalledWith(CUSTOMER_ROUTES.HOME);
  });
});
