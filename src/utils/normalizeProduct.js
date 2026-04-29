function normalizeText(value, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function normalizeSearchField(value, fallback = '') {
  if (typeof value === 'string' || typeof value === 'number') {
    const normalizedValue = String(value).trim();

    return normalizedValue || fallback;
  }

  return fallback;
}

function normalizeStringList(value) {
  if (Array.isArray(value)) {
    return value
      .map(item => normalizeSearchField(item))
      .filter(Boolean);
  }

  const normalizedValue = normalizeSearchField(value);

  return normalizedValue ? [normalizedValue] : [];
}

function normalizeNonNegativeNumber(value, fallback = 0) {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }

  return parsedValue >= 0 ? parsedValue : fallback;
}

function isRemoteUrl(value = '') {
  return /^https?:\/\//i.test(normalizeText(value, ''));
}

function slugifyText(value) {
  return normalizeText(value, '')
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeProduct(product = {}) {
  const normalizedName = normalizeText(product.name, 'Unnamed product');
  const fallbackKey =
    slugifyText(product.slug) ||
    slugifyText(product.id) ||
    slugifyText(normalizedName);
  const normalizedId = normalizeText(product.id, fallbackKey);
  const normalizedSlug =
    normalizeText(product.slug, slugifyText(normalizedId)) || fallbackKey;
  const normalizedImage = normalizeText(product.image, '');
  const normalizedImageKey =
    normalizeText(product.imageKey) ||
    (normalizedImage && !isRemoteUrl(normalizedImage) ? normalizedImage : '');

  return {
    id: normalizedId,
    name: normalizedName,
    slug: normalizedSlug,
    price: normalizeNonNegativeNumber(product.price),
    category: normalizeText(product.category, 'Uncategorized'),
    description: normalizeText(
      product.description,
      'No description available yet.',
    ),
    unit: normalizeSearchField(product.unit),
    size: normalizeSearchField(product.size),
    tags: normalizeStringList(product.tags),
    keywords: normalizeStringList(product.keywords),
    imageKey: normalizedImageKey,
    image: normalizedImage,
    stock: normalizeNonNegativeNumber(product.stock),
  };
}

export function hasRemoteProductImage(image) {
  return isRemoteUrl(image);
}
