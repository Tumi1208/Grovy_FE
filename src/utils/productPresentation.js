const CATEGORY_VARIANT_MAP = Object.freeze({
  beverages: '1 bottle',
  dairyandeggs: '1 tray',
  fruits: '1 kg',
  meat: '1 pack',
  pantry: '1 pack',
  vegetables: '1 kg',
});

const COMMON_ATTRIBUTES = Object.freeze([
  'red',
  'green',
  'yellow',
  'orange',
  'white',
  'black',
  'purple',
  'pink',
  'sweet',
  'fresh',
  'classic',
  'crisp',
  'lemon',
]);

function normalizeLookupKey(value) {
  return typeof value === 'string' && value.trim()
    ? value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '')
    : '';
}

function extractVariantFromText(value = '') {
  const match = value.match(
    /(\d+\s?(?:kg|g|mg|l|ml|pcs?|pieces?|pack|packs|bottle|bottles))/i,
  );

  return match ? match[1] : '';
}

function capitalizeWord(value = '') {
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : '';
}

function extractAttributeFromName(name = '') {
  const words = name
    .trim()
    .split(/\s+/)
    .map(word => word.replace(/[^a-z]/gi, '').toLowerCase())
    .filter(Boolean);

  const matchedAttribute = words.find(word => COMMON_ATTRIBUTES.includes(word));

  if (matchedAttribute) {
    return capitalizeWord(matchedAttribute);
  }

  return words[0] ? capitalizeWord(words[0]) : '';
}

export function getProductVariant(product = {}) {
  const variantFromName = extractVariantFromText(product.name);

  if (variantFromName) {
    return variantFromName;
  }

  if (/bunch/i.test(product.name)) {
    return '1 bunch';
  }

  if (/root/i.test(product.name)) {
    return '1 root';
  }

  if (/can/i.test(product.name)) {
    return '1 can';
  }

  if (/juice/i.test(product.name)) {
    return '1 bottle';
  }

  return CATEGORY_VARIANT_MAP[normalizeLookupKey(product.category)] || '1 pc';
}

export function getProductSubtitle(product = {}) {
  const variant = getProductVariant(product);
  const attribute = extractAttributeFromName(product.name || '');

  return attribute ? `${variant}, ${attribute}` : variant;
}
