function normalizeLookupKey(value) {
  return typeof value === 'string' && value.trim()
    ? value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '')
    : '';
}

export const defaultProductImage = require('../assets/images/products/Vegetable-Bag copy.png');

export const ProductImages = Object.freeze({
  apple: require('../assets/images/products/apple.png'),
  appleJuice: require('../assets/images/products/Apple juice.png'),
  banana: require('../assets/images/products/banana.png'),
  beef: require('../assets/images/products/beef.png'),
  chicken: require('../assets/images/products/chicken.png'),
  cokeCanRed: require('../assets/images/products/coke can red.png'),
  cokeClassic: require('../assets/images/products/coke can red.png'),
  cokeDiet: require('../assets/images/products/coke diet.png'),
  dietCola: require('../assets/images/products/coke diet.png'),
  eggNoodles: require('../assets/images/products/egg noodles.png'),
  eggsRedChick: require('../assets/images/products/eggs red chick.png'),
  eggsWhiteChick: require('../assets/images/products/eggs white chick.png'),
  ginger: require('../assets/images/products/Ginger.png'),
  mayonnaise: require('../assets/images/products/mayonnaise eggless.png'),
  mayonnaiseEggless: require('../assets/images/products/mayonnaise eggless.png'),
  noodles: require('../assets/images/products/noodles.png'),
  oilAndGhee: require('../assets/images/products/oil and ghee.png'),
  orangeJuice: require('../assets/images/products/orange juice.png'),
  pasta: require('../assets/images/products/pasta.png'),
  pepsiCan: require('../assets/images/products/Pepsi-033-L-Dry.png'),
  pulses: require('../assets/images/products/pulses.png'),
  rice: require('../assets/images/products/rice.png'),
  shimla: require('../assets/images/products/shimla.png'),
  shimlaPepper: require('../assets/images/products/shimla.png'),
  spriteCan: require('../assets/images/products/spritecan.png'),
});

const PRODUCT_IMAGE_KEY_ALIASES = Object.freeze({
  apple: 'apple',
  applejuice: 'appleJuice',
  banana: 'banana',
  beef: 'beef',
  chicken: 'chicken',
  cokeclassic: 'cokeClassic',
  cokecanred: 'cokeCanRed',
  cokediet: 'cokeDiet',
  dietcola: 'dietCola',
  eggnoodles: 'eggNoodles',
  eggsredchick: 'eggsRedChick',
  eggswhitechick: 'eggsWhiteChick',
  ginger: 'ginger',
  mayonnaise: 'mayonnaise',
  mayonnaiseeggless: 'mayonnaiseEggless',
  noodles: 'noodles',
  oilandghee: 'oilAndGhee',
  orangejuice: 'orangeJuice',
  pasta: 'pasta',
  pepsican: 'pepsiCan',
  pulses: 'pulses',
  rice: 'rice',
  shimla: 'shimla',
  shimlapepper: 'shimlaPepper',
  spritecan: 'spriteCan',
});

const CategoryFallbackImages = Object.freeze({
  bakeryitems: require('../assets/images/products/bakery items.png'),
  beverages: require('../assets/images/products/beverages.png'),
  dairyandeggs: require('../assets/images/products/dairy and eggs.png'),
  fruits: require('../assets/images/products/veg and fruits.png'),
  meat: require('../assets/images/products/fresh-fish-meat-.png'),
  pantry: require('../assets/images/products/noodles.png'),
  vegetables: require('../assets/images/products/veg and fruits.png'),
});

export function resolveProductImageKey(imageKey) {
  const normalizedKey = normalizeLookupKey(imageKey);

  return PRODUCT_IMAGE_KEY_ALIASES[normalizedKey] || null;
}

export function getProductImage(imageKey) {
  const resolvedImageKey = resolveProductImageKey(imageKey);

  return resolvedImageKey
    ? ProductImages[resolvedImageKey]
    : defaultProductImage;
}

export function getLocalProductImage(imageKey) {
  const resolvedImageKey = resolveProductImageKey(imageKey);

  return resolvedImageKey ? ProductImages[resolvedImageKey] : null;
}

export function getCategoryFallbackImage(category) {
  return (
    CategoryFallbackImages[normalizeLookupKey(category)] || defaultProductImage
  );
}

export function getProductImageSource(product = {}) {
  const localProductImage = getLocalProductImage(product.imageKey);

  return localProductImage || getCategoryFallbackImage(product.category);
}

export default ProductImages;
