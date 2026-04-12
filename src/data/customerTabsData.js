import { DEMO_PRODUCTS } from './demoProducts';

export const EXPLORE_CATEGORY_CARDS = Object.freeze([
  {
    id: 'fruits',
    title: 'Fresh fruits',
    category: 'Fruits',
    description: 'Everyday fruit for breakfast, snacks and lunch boxes',
    backgroundColor: '#F5E8DF',
    borderColor: '#E8D6C9',
  },
  {
    id: 'vegetables',
    title: 'Vegetables',
    category: 'Vegetables',
    description: 'Cooking staples for stir-fries, soups and home meals',
    backgroundColor: '#EAF0E3',
    borderColor: '#D7E1CC',
  },
  {
    id: 'beverages',
    title: 'Beverages',
    category: 'Beverages',
    description: 'Juice, soda and fridge-ready drinks',
    backgroundColor: '#F7EEDC',
    borderColor: '#E7DAB8',
  },
  {
    id: 'pantry',
    title: 'Pantry',
    category: 'Pantry',
    description: 'Rice, noodles, pulses and cooking essentials',
    backgroundColor: '#F3ECE2',
    borderColor: '#E3D8C8',
  },
  {
    id: 'meat',
    title: 'Meat & fish',
    category: 'Meat',
    description: 'Protein choices for family dinners and meal prep',
    backgroundColor: '#F6E6E3',
    borderColor: '#E9D0CB',
  },
]);

export const FAVOURITE_PRODUCT_IDS = Object.freeze([
  'grovy-apple-001',
  'grovy-banana-001',
  'grovy-orange-juice-001',
  'grovy-pasta-001',
]);

export const CUSTOMER_ACCOUNT_MENU = Object.freeze([
  'Edit Profile',
  'Orders',
  'Delivery Address',
  'Payment Methods',
  'Notifications',
  'Help',
  'About',
]);

export const CUSTOMER_DEMO_PRODUCTS = DEMO_PRODUCTS;
