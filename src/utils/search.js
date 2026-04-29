export function normalizeSearchText(value) {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value).trim().toLowerCase();
  }

  return '';
}

function normalizeSearchValues(value) {
  if (Array.isArray(value)) {
    return value.map(normalizeSearchText).filter(Boolean);
  }

  const normalizedValue = normalizeSearchText(value);

  return normalizedValue ? [normalizedValue] : [];
}

export function getProductSearchText(product = {}) {
  return [
    product.name,
    product.category,
    product.description,
    product.unit,
    product.size,
    product.slug,
    product.imageKey,
    ...normalizeSearchValues(product.tags),
    ...normalizeSearchValues(product.keywords),
  ]
    .map(normalizeSearchText)
    .filter(Boolean)
    .join(' ');
}

export function productMatchesSearch(product = {}, query = '') {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return true;
  }

  const searchableText = getProductSearchText(product);
  const queryTerms = normalizedQuery.split(/\s+/).filter(Boolean);

  return queryTerms.every(term => searchableText.includes(term));
}
