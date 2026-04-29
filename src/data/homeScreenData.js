import {
  getCategoryFallbackImage,
  getProductImageSource,
} from '../assets/productImages';
import { productMatchesSearch } from '../utils/search';

const HOME_CATEGORY_STYLES = Object.freeze({
  fruits: {
    title: 'Fresh fruit',
    description: 'Apples, bananas and juice-ready picks',
    backgroundColor: '#F5E8DF',
    borderColor: '#E8D6C9',
    accentColor: '#F1D7C7',
  },
  vegetables: {
    title: 'Vegetables',
    description: 'Greens and staples for daily cooking',
    backgroundColor: '#EAF0E3',
    borderColor: '#D7E1CC',
    accentColor: '#D7E5CB',
  },
  pantry: {
    title: 'Pantry',
    description: 'Rice, noodles, pulses and cooking basics',
    backgroundColor: '#F3ECE2',
    borderColor: '#E3D8C8',
    accentColor: '#E8D8C2',
  },
  beverages: {
    title: 'Beverages',
    description: 'Juice and soft drinks for the fridge',
    backgroundColor: '#F7EEDC',
    borderColor: '#E7DAB8',
    accentColor: '#F0DEB4',
  },
  meat: {
    title: 'Meat',
    description: 'Chicken and beef for main meals',
    backgroundColor: '#F6E6E3',
    borderColor: '#E9D0CB',
    accentColor: '#F0D4D0',
  },
});

const HOME_SECTION_PRODUCTS = Object.freeze({
  exclusiveOffer: [
    {
      id: 'grovy-apple-gala-001',
      name: 'Gala Apples Bag',
      price: 1.59,
      category: 'Fruits',
      imageKey: 'apple',
    },
    {
      id: 'grovy-banana-organic-001',
      name: 'Organic Banana Bunch',
      price: 1.29,
      category: 'Fruits',
      imageKey: 'banana',
    },
    {
      id: 'grovy-red-shimla-pepper-001',
      name: 'Red Shimla Pepper',
      price: 1.69,
      category: 'Vegetables',
      imageKey: 'shimlaPepper',
    },
    {
      id: 'grovy-ginger-001',
      name: 'Fresh Ginger Root',
      price: 0.89,
      category: 'Vegetables',
      imageKey: 'ginger',
    },
  ],
  bestSelling: [
    {
      id: 'grovy-orange-juice-001',
      name: 'Orange Juice 1L',
      price: 3.59,
      category: 'Beverages',
      imageKey: 'orangeJuice',
    },
    {
      id: 'grovy-classic-cola-001',
      name: 'Classic Cola Can',
      price: 0.99,
      category: 'Beverages',
      imageKey: 'cokeClassic',
    },
    {
      id: 'grovy-jasmine-rice-001',
      name: 'Jasmine Rice',
      price: 6.29,
      category: 'Pantry',
      imageKey: 'rice',
    },
    {
      id: 'grovy-penne-pasta-001',
      name: 'Penne Pasta',
      price: 2.99,
      category: 'Pantry',
      imageKey: 'pasta',
    },
  ],
  groceries: [
    {
      id: 'grovy-chicken-001',
      name: 'Chicken Breast Cuts',
      price: 6.49,
      category: 'Meat',
      imageKey: 'chicken',
    },
    {
      id: 'grovy-beef-bone-001',
      name: 'Beef Soup Bones',
      price: 5.49,
      category: 'Meat',
      imageKey: 'beef',
    },
    {
      id: 'grovy-basmati-rice-001',
      name: 'Basmati Rice',
      price: 6.69,
      category: 'Pantry',
      imageKey: 'rice',
    },
    {
      id: 'grovy-red-lentils-001',
      name: 'Red Lentils',
      price: 2.89,
      category: 'Pantry',
      imageKey: 'pulses',
    },
  ],
});

const LOCAL_HOME_IMAGES = Object.freeze({
  banner: require('../assets/images/products/Vegetable-Bag copy.png'),
});

function normalizeLookupKey(value) {
  return typeof value === 'string' && value.trim()
    ? value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '')
    : '';
}

function createHomeMockProduct(overrides) {
  return {
    id: overrides.id,
    name: overrides.name,
    slug: overrides.slug || normalizeLookupKey(overrides.name),
    price: overrides.price || 0,
    category: overrides.category || 'Groceries',
    description:
      overrides.description ||
      'Everyday grocery item available in the Grovy assortment.',
    imageKey: overrides.imageKey || '',
    stock: overrides.stock || 12,
  };
}

function toHomeProduct(product, overrides = {}) {
  const resolvedProduct =
    product ||
    createHomeMockProduct({
      id: overrides.id || normalizeLookupKey(overrides.name),
      name: overrides.name || 'Grovy Item',
      price: overrides.price,
      category: overrides.category,
      description: overrides.description,
      imageKey: overrides.imageKey,
      stock: overrides.stock,
    });

  return {
    ...resolvedProduct,
    ...overrides,
    imageSource:
      overrides.imageSource || getProductImageSource(resolvedProduct),
  };
}

function getProductByKey(productsByKey, ...keys) {
  return keys.map(key => productsByKey[normalizeLookupKey(key)]).find(Boolean);
}

function buildConfiguredSection(productsByKey, items = []) {
  return items.map(item =>
    toHomeProduct(getProductByKey(productsByKey, item.id), item),
  );
}

function buildCategoryCard(category) {
  const normalizedCategory = normalizeLookupKey(category);
  const config = HOME_CATEGORY_STYLES[normalizedCategory];

  if (!config) {
    return null;
  }

  return {
    id: `grocery-${normalizedCategory}`,
    category,
    imageSource: getCategoryFallbackImage(category),
    ...config,
  };
}

export function buildHomeScreenData(products = []) {
  const productsByKey = products.reduce((accumulator, product) => {
    const keys = [
      product.id,
      product.slug,
      product.name,
      product.imageKey,
      product.category,
    ];

    keys.forEach(key => {
      const normalizedKey = normalizeLookupKey(key);

      if (normalizedKey && !accumulator[normalizedKey]) {
        accumulator[normalizedKey] = product;
      }
    });

    return accumulator;
  }, {});

  const groceryCategories = [
    buildCategoryCard('Fruits'),
    buildCategoryCard('Vegetables'),
    buildCategoryCard('Pantry'),
    buildCategoryCard('Beverages'),
    buildCategoryCard('Meat'),
  ].filter(Boolean);

  return {
    banner: {
      title: 'Fresh produce and pantry basics',
      subtitle: 'A practical basket for everyday cooking at home.',
      imageSource: LOCAL_HOME_IMAGES.banner,
    },
    exclusiveOffer: buildConfiguredSection(
      productsByKey,
      HOME_SECTION_PRODUCTS.exclusiveOffer,
    ),
    bestSelling: buildConfiguredSection(
      productsByKey,
      HOME_SECTION_PRODUCTS.bestSelling,
    ),
    groceryCategories,
    groceries: buildConfiguredSection(
      productsByKey,
      HOME_SECTION_PRODUCTS.groceries,
    ),
  };
}

export function filterHomeSectionProducts(products = [], query = '') {
  return products.filter(product => productMatchesSearch(product, query));
}
