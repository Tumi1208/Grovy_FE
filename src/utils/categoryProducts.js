export function normalizeCategoryValue(value) {
  return typeof value === 'string' && value.trim()
    ? value.trim().toLowerCase()
    : '';
}

export function isProductInCategory(product = {}, category = '') {
  return (
    normalizeCategoryValue(product.category) === normalizeCategoryValue(category)
  );
}

export function getProductsByCategory(products = [], category = '') {
  return products.filter(product => isProductInCategory(product, category));
}
