import { DEMO_PRODUCTS } from './demoProducts';

export const EXPLORE_CATEGORY_CARDS = Object.freeze([
  {
    id: 'fruits',
    title: 'Fresh fruits',
    category: 'Fruits',
    description: 'Everyday fruit for breakfast, snacks and lunch boxes',
    aliases: ['fruit', 'apple', 'banana', 'berries', 'citrus'],
    backgroundColor: '#F5E8DF',
    borderColor: '#E8D6C9',
  },
  {
    id: 'vegetables',
    title: 'Vegetables',
    category: 'Vegetables',
    description: 'Cooking staples for stir-fries, soups and home meals',
    aliases: ['vegetable', 'veggies', 'greens', 'produce'],
    backgroundColor: '#EAF0E3',
    borderColor: '#D7E1CC',
  },
  {
    id: 'dairy-and-eggs',
    title: 'Dairy & eggs',
    category: 'Dairy and Eggs',
    description: 'Fridge basics for breakfast, baking and everyday cooking',
    aliases: ['dairy', 'eggs', 'milk', 'cheese', 'butter', 'yogurt'],
    backgroundColor: '#EEF0F6',
    borderColor: '#D8DDEB',
  },
  {
    id: 'beverages',
    title: 'Beverages',
    category: 'Beverages',
    description: 'Juice, soda and fridge-ready drinks',
    aliases: ['drinks', 'juice', 'soda', 'soft drinks', 'cola', 'coke'],
    backgroundColor: '#F7EEDC',
    borderColor: '#E7DAB8',
  },
  {
    id: 'pantry',
    title: 'Pantry',
    category: 'Pantry',
    description: 'Rice, noodles, pulses and cooking essentials',
    aliases: ['rice', 'noodles', 'pasta', 'pulses', 'oil', 'staples'],
    backgroundColor: '#F3ECE2',
    borderColor: '#E3D8C8',
  },
  {
    id: 'meat',
    title: 'Meat & fish',
    category: 'Meat',
    description: 'Protein choices for family dinners and meal prep',
    aliases: ['meat', 'fish', 'seafood', 'protein', 'chicken', 'beef'],
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
