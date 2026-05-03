import TestRenderer, { act } from 'react-test-renderer';
import { Alert } from 'react-native';
import HomeScreen from '../src/screens/customer/HomeScreen';
import { CUSTOMER_ROUTES } from '../src/constants/routes';
import { DEMO_PRODUCTS } from '../src/data/demoProducts';

const mockUseApp = jest.fn();
const mockUseCart = jest.fn();
const mockUseFavourite = jest.fn();
const mockGetProducts = jest.fn();

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }) => {
    const React = require('react');
    const { View } = require('react-native');

    return <View>{children}</View>;
  },
}));

jest.mock('../src/context/AppContext', () => ({
  useApp: () => mockUseApp(),
}));

jest.mock('../src/context/CartContext', () => ({
  useCart: () => mockUseCart(),
}));

jest.mock('../src/context/FavouriteContext', () => ({
  useFavourite: () => mockUseFavourite(),
}));

jest.mock('../src/services/productService', () => ({
  getProducts: (...args) => mockGetProducts(...args),
}));

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

jest.mock('../src/components/ProductQuickActionsSheet', () => {
  return function MockProductQuickActionsSheet() {
    return null;
  };
});

jest.mock('../src/components/home/SmartBasketPreviewSheet', () => {
  return function MockSmartBasketPreviewSheet({
    collection,
    onAddAll,
    onClose,
    visible,
  }) {
    const React = require('react');
    const { Pressable, Text, View } = require('react-native');

    if (!visible || !collection) {
      return null;
    }

    return (
      <View testID="mock-smart-basket-preview">
        <Text>{collection.title}</Text>
        <Pressable
          onPress={() => onAddAll?.(collection)}
          testID="mock-smart-basket-add-all"
        />
        <Pressable onPress={onClose} testID="mock-smart-basket-close" />
      </View>
    );
  };
});

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

function findAllByTestId(root, testID) {
  return root.findAll(
    node => node.props?.testID === testID && typeof node.type === 'string',
  );
}

describe('HomeScreen smart basket preview', () => {
  const addToCart = jest.fn();
  const navigation = {
    navigate: jest.fn(),
  };
  let activeRenderer = null;
  let alertSpy;

  beforeEach(() => {
    jest.useFakeTimers();
    addToCart.mockReset();
    navigation.navigate.mockReset();
    mockGetProducts.mockResolvedValue(DEMO_PRODUCTS);
    mockUseApp.mockReturnValue({
      currentUser: {
        location: {
          shortLabel: 'HCMC, Vietnam',
        },
      },
    });
    mockUseCart.mockReturnValue({
      addToCart,
    });
    mockUseFavourite.mockReturnValue({
      addToFavourites: jest.fn(),
      isFavourite: jest.fn(() => false),
    });
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
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
    alertSpy.mockRestore();
    mockUseApp.mockReset();
    mockUseCart.mockReset();
    mockUseFavourite.mockReset();
    mockGetProducts.mockReset();
  });

  async function renderScreen() {
    await act(async () => {
      activeRenderer = TestRenderer.create(
        <HomeScreen navigation={navigation} />,
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    act(() => {
      jest.runOnlyPendingTimers();
    });

    return activeRenderer;
  }

  it('opens preview before adding smart basket items to cart', async () => {
    const renderer = await renderScreen();

    act(() => {
      findClosestPressableForText(
        renderer.root,
        'Weekly Fresh Basket',
      ).props.onPress();
    });
    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(addToCart).not.toHaveBeenCalled();
    expect(
      findAllByTestId(renderer.root, 'mock-smart-basket-preview'),
    ).toHaveLength(1);

    act(() => {
      renderer.root
        .findByProps({ testID: 'mock-smart-basket-add-all' })
        .props.onPress();
    });
    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(addToCart.mock.calls.map(([product]) => product.id)).toEqual([
      'grovy-apple-001',
      'grovy-banana-001',
      'grovy-eggs-red-001',
      'grovy-rice-001',
      'grovy-chicken-001',
      'grovy-ginger-001',
    ]);
    expect(addToCart.mock.calls.every(([, quantity]) => quantity === 1)).toBe(
      true,
    );
    expect(
      findAllByTestId(renderer.root, 'mock-smart-basket-preview'),
    ).toHaveLength(0);
    expect(alertSpy).toHaveBeenCalledWith(
      'Weekly Fresh Basket',
      'Added 6 items to cart.',
    );
  });

  it('returns empty searches to the smart basket section', async () => {
    const renderer = await renderScreen();

    act(() => {
      renderer.root
        .findByProps({ placeholder: 'Search groceries' })
        .props.onChangeText('zzzz');
    });

    expect(
      renderer.root.findByProps({ placeholder: 'Search groceries' }).props
        .value,
    ).toBe('zzzz');

    act(() => {
      findClosestPressableForText(
        renderer.root,
        'View Smart Baskets',
      ).props.onPress();
    });
    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(
      renderer.root.findByProps({ placeholder: 'Search groceries' }).props
        .value,
    ).toBe('');
    expect(
      renderer.root.findAll(
        node => node.type === 'Text' && getNodeText(node) === 'Smart Baskets',
      ).length,
    ).toBeGreaterThan(0);
  });

  it('shows search results near the top and hides smart sections while searching', async () => {
    const renderer = await renderScreen();

    act(() => {
      renderer.root
        .findByProps({ placeholder: 'Search groceries' })
        .props.onChangeText('apple');
    });

    expect(
      renderer.root.findAll(
        node => node.type === 'Text' && getNodeText(node) === 'Search results',
      ).length,
    ).toBeGreaterThan(0);
    expect(
      renderer.root.findAll(
        node => node.type === 'Text' && getNodeText(node) === 'Smart Baskets',
      ),
    ).toHaveLength(0);

    act(() => {
      findClosestPressableForText(renderer.root, 'Crisp Apple').props.onPress();
    });

    expect(navigation.navigate).toHaveBeenCalledWith(
      CUSTOMER_ROUTES.PRODUCT_DETAIL,
      expect.objectContaining({
        productId: 'grovy-apple-001',
      }),
    );
  });
});
