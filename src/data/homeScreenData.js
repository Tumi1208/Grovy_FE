import { getProductImageSource } from '../assets/productImages';

const HOME_CATEGORY_STYLES = Object.freeze({
  pulses: {
    backgroundColor: '#EEF7F1',
    accentColor: '#53B175',
  },
  rice: {
    backgroundColor: '#FFF6E4',
    accentColor: '#F8A44C',
  },
});

const LOCAL_HOME_IMAGES = Object.freeze({
  banner: require('../assets/images/products/Vegetable-Bag copy.png'),
  beefBone: require('../assets/images/products/beef.png'),
  chicken: require('../assets/images/products/chicken.png'),
  pulses: require('../assets/images/products/pulses.png'),
  rice: require('../assets/images/products/rice.png'),
  redMirch: require('../assets/images/products/shimla.png'),
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
      overrides.description || 'Grovy Home local item used to match the Figma frame.',
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
      stock: overrides.stock,
    });

  return {
    ...resolvedProduct,
    ...overrides,
    imageSource: overrides.imageSource || getProductImageSource(resolvedProduct),
  };
}

function getProductByKey(productsByKey, ...keys) {
  return keys
    .map(key => productsByKey[normalizeLookupKey(key)])
    .find(Boolean);
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

  const appleProduct = getProductByKey(
    productsByKey,
    'grovy-apple-001',
    'apple',
    'crisp-apple',
  );
  const bananaProduct = getProductByKey(
    productsByKey,
    'grovy-banana-001',
    'banana',
    'sweet-banana-bunch',
  );
  const gingerProduct = getProductByKey(
    productsByKey,
    'grovy-ginger-001',
    'ginger',
    'fresh-ginger-root',
  );
  const chickenProduct = getProductByKey(
    productsByKey,
    'grovy-chicken-001',
    'chicken',
    'chicken-breast-cuts',
  );

  const exclusiveOffer = [
    toHomeProduct(appleProduct, {
      name: 'Organic Apples',
      description: '7pcs, Priceg',
    }),
    toHomeProduct(bananaProduct, {
      name: 'Organic Bananas',
      description: '7pcs, Priceg',
    }),
  ];

  const bestSelling = [
    toHomeProduct(
      getProductByKey(productsByKey, 'grovy-shimla-pepper-001', 'shimlapepper'),
      {
        id: 'home-red-mirch',
        name: 'Red Mirch',
        description: '1kg, Priceg',
        price: 4.99,
        imageSource: LOCAL_HOME_IMAGES.redMirch,
      },
    ),
    toHomeProduct(gingerProduct, {
      name: 'Ginger',
      description: '250gm, Priceg',
    }),
  ];

  const groceryCategories = [
    {
      id: 'grocery-pulses',
      title: 'Pulses',
      imageSource: LOCAL_HOME_IMAGES.pulses,
      ...HOME_CATEGORY_STYLES.pulses,
    },
    {
      id: 'grocery-rice',
      title: 'Rice',
      imageSource: LOCAL_HOME_IMAGES.rice,
      ...HOME_CATEGORY_STYLES.rice,
    },
  ];

  const groceries = [
    toHomeProduct(
      createHomeMockProduct({
        id: 'home-beef-bone',
        name: 'Beef Bone',
        price: 4.99,
        category: 'Meat',
        stock: 10,
      }),
      {
        description: '1kg, Priceg',
        imageSource: LOCAL_HOME_IMAGES.beefBone,
      },
    ),
    toHomeProduct(chickenProduct, {
      name: 'Broiler Chicken',
      description: '1kg, Priceg',
      imageSource: LOCAL_HOME_IMAGES.chicken,
    }),
  ];

  return {
    banner: {
      title: 'Fresh Vegetables',
      subtitle: 'Get Up To 40% OFF',
      imageSource: LOCAL_HOME_IMAGES.banner,
    },
    exclusiveOffer,
    bestSelling,
    groceryCategories,
    groceries,
  };
}

export function filterHomeSectionProducts(products = [], query = '') {
  const normalizedQuery = normalizeLookupKey(query);

  if (!normalizedQuery) {
    return products;
  }

  return products.filter(product =>
    `${product.name} ${product.description} ${product.category}`
      .toLowerCase()
      .includes(normalizedQuery),
  );
}
