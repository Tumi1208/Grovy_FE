import TestRenderer, { act } from 'react-test-renderer';
import ExploreScreen from '../src/screens/customer/ExploreScreen';
import { DEMO_PRODUCTS } from '../src/data/demoProducts';

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

describe('ExploreScreen empty search actions', () => {
  const navigation = {
    navigate: jest.fn(),
  };
  let activeRenderer = null;

  beforeEach(() => {
    jest.useFakeTimers();
    navigation.navigate.mockReset();
    mockGetProducts.mockResolvedValue(DEMO_PRODUCTS);
    mockUseCart.mockReturnValue({
      addToCart: jest.fn(),
    });
    mockUseFavourite.mockReturnValue({
      addToFavourites: jest.fn(),
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
    mockGetProducts.mockReset();
  });

  async function renderScreen() {
    await act(async () => {
      activeRenderer = TestRenderer.create(
        <ExploreScreen navigation={navigation} />,
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    act(() => {
      jest.runOnlyPendingTimers();
    });

    return activeRenderer;
  }

  it('clears an empty search back to the aisle list', async () => {
    const renderer = await renderScreen();

    act(() => {
      renderer.root
        .findByProps({ placeholder: 'Search groceries and aisles' })
        .props.onChangeText('zzzz');
    });

    expect(
      renderer.root.findAll(
        node => node.type === 'Text' && getNodeText(node) === 'No results found',
      ),
    ).toHaveLength(1);

    act(() => {
      findClosestPressableForText(renderer.root, 'Clear Search').props.onPress();
    });

    expect(
      renderer.root.findByProps({ placeholder: 'Search groceries and aisles' })
        .props.value,
    ).toBe('');
  });
});
