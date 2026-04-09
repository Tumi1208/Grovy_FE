import { normalizeProduct } from '../utils/normalizeProduct';

export const EXPLORE_CATEGORY_CARDS = Object.freeze([
  {
    id: 'fruits',
    title: 'Fresh Fruits',
    category: 'Fruits',
    backgroundColor: '#FDE8E4',
    borderColor: '#F2CFC7',
  },
  {
    id: 'vegetables',
    title: 'Fresh Vegetables',
    category: 'Vegetables',
    backgroundColor: '#EDF7E6',
    borderColor: '#D4E7C8',
  },
  {
    id: 'beverages',
    title: 'Beverages',
    category: 'Beverages',
    backgroundColor: '#FFF4D9',
    borderColor: '#F2E2B2',
  },
  {
    id: 'pantry',
    title: 'Pantry',
    category: 'Pantry',
    backgroundColor: '#F5EBFF',
    borderColor: '#E2D4F8',
  },
  {
    id: 'meat',
    title: 'Meat & Fish',
    category: 'Meat',
    backgroundColor: '#FFE9EE',
    borderColor: '#F4CDD7',
  },
]);

export const FAVOURITE_PRODUCT_IDS = Object.freeze([
  'grovy-apple-001',
  'grovy-banana-001',
  'grovy-orange-juice-001',
  'grovy-pasta-001',
]);

export const CUSTOMER_ACCOUNT_MENU = Object.freeze([
  'Orders',
  'My Details',
  'Delivery Address',
  'Payment Methods',
  'Promo Code',
  'Notifications',
  'Help',
  'About',
]);

export const CUSTOMER_DEMO_PRODUCTS = Object.freeze(
  [
    {
      id: 'grovy-apple-001',
      name: 'Crisp Apple',
      slug: 'crisp-apple',
      price: 1.29,
      category: 'Fruits',
      description:
        'Sweet and crunchy apples for snacks, lunch boxes, and salads.',
      stock: 34,
      imageKey: 'apple',
    },
    {
      id: 'grovy-banana-001',
      name: 'Sweet Banana Bunch',
      slug: 'sweet-banana-bunch',
      price: 1.09,
      category: 'Fruits',
      description:
        'Ripe bananas that work well for breakfast bowls, smoothies, and quick snacks.',
      stock: 41,
      imageKey: 'banana',
    },
    {
      id: 'grovy-ginger-001',
      name: 'Fresh Ginger Root',
      slug: 'fresh-ginger-root',
      price: 0.89,
      category: 'Vegetables',
      description:
        'Fresh ginger for teas, stir-fries, soups, and everyday home cooking.',
      stock: 26,
      imageKey: 'ginger',
    },
    {
      id: 'grovy-orange-juice-001',
      name: 'Orange Juice 1L',
      slug: 'orange-juice-1l',
      price: 3.59,
      category: 'Beverages',
      description:
        'Bright citrus juice for breakfast, lunch boxes, and chilled pantry staples.',
      stock: 18,
      imageKey: 'orangeJuice',
    },
    {
      id: 'grovy-egg-noodles-001',
      name: 'Egg Noodles',
      slug: 'egg-noodles',
      price: 2.49,
      category: 'Pantry',
      description:
        'Quick-cook egg noodles for stir-fries, soups, and simple dinner prep.',
      stock: 29,
      imageKey: 'eggNoodles',
    },
    {
      id: 'grovy-pasta-001',
      name: 'Durum Wheat Pasta',
      slug: 'durum-wheat-pasta',
      price: 2.79,
      category: 'Pantry',
      description:
        'Reliable pasta staple for weeknight sauces, baked dishes, and meal prep.',
      stock: 27,
      imageKey: 'pasta',
    },
    {
      id: 'grovy-rice-001',
      name: 'Long Grain Rice',
      slug: 'long-grain-rice',
      price: 5.99,
      category: 'Pantry',
      description:
        'Versatile long grain rice for family meals, bowls, and side dishes.',
      stock: 21,
      imageKey: 'rice',
    },
    {
      id: 'grovy-chicken-001',
      name: 'Chicken Breast Cuts',
      slug: 'chicken-breast-cuts',
      price: 6.49,
      category: 'Meat',
      description:
        'Fresh chicken cuts for grills, curries, stir-fries, and protein-focused meals.',
      stock: 16,
      imageKey: 'chicken',
    },
  ].map(normalizeProduct),
);
