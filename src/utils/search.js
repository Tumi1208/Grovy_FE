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

export function getCategorySearchText(category = {}) {
  return [
    category.title,
    category.name,
    category.category,
    category.description,
    ...normalizeSearchValues(category.aliases),
    ...normalizeSearchValues(category.keywords),
  ]
    .map(normalizeSearchText)
    .filter(Boolean)
    .join(' ');
}

function searchTextMatchesQuery(searchableText, query = '') {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return true;
  }

  const queryTerms = normalizedQuery.split(/\s+/).filter(Boolean);

  return queryTerms.every(term => searchableText.includes(term));
}

export function productMatchesSearch(product = {}, query = '') {
  return searchTextMatchesQuery(getProductSearchText(product), query);
}

export function categoryMatchesSearch(category = {}, query = '') {
  return searchTextMatchesQuery(getCategorySearchText(category), query);
}
