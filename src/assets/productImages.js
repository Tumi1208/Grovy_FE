function normalizeLookupKey(value) {
  return typeof value === 'string' && value.trim()
    ? value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '')
    : '';
}

const productImages = Object.freeze({
  apple: require('./images/products/apple.png'),
  applejuice: require('./images/products/Apple juice.png'),
  banana: require('./images/products/banana.png'),
  chicken: require('./images/products/chicken.png'),
  cokeclassic: require('./images/products/coke can red.png'),
  eggnoodles: require('./images/products/egg noodles.png'),
  ginger: require('./images/products/Ginger.png'),
  orangejuice: require('./images/products/orange juice.png'),
  pasta: require('./images/products/pasta.png'),
  rice: require('./images/products/rice.png'),
  shimlapepper: require('./images/products/shimla.png'),
  spritecan: require('./images/products/spritecan.png'),
});

const categoryFallbackImages = Object.freeze({
  beverages: require('./images/products/beverages.png'),
  dairyandeggs: require('./images/products/dairy and eggs.png'),
  fruits: require('./images/products/veg and fruits.png'),
  meat: require('./images/products/fresh-fish-meat-.png'),
  pantry: require('./images/products/noodles.png'),
  vegetables: require('./images/products/veg and fruits.png'),
});

export const defaultProductImage = require('./images/products/Vegetable-Bag copy.png');

export function getLocalProductImage(imageKey) {
  return productImages[normalizeLookupKey(imageKey)] || null;
}

export function getCategoryFallbackImage(category) {
  return (
    categoryFallbackImages[normalizeLookupKey(category)] || defaultProductImage
  );
}

export function getProductImageSource(product = {}) {
  return (
    getLocalProductImage(product.imageKey) ||
    getCategoryFallbackImage(product.category)
  );
}

export default productImages;
