import { apiRequest } from './apiClient';

function normalizeProduct(product) {
  return {
    ...product,
    image: product.image || null,
    stock: typeof product.stock === 'number' ? product.stock : 0,
  };
}

export async function getProducts() {
  const data = await apiRequest('/products');

  return Array.isArray(data?.items) ? data.items.map(normalizeProduct) : [];
}

export async function getProductById(productId) {
  const product = await apiRequest(`/products/${encodeURIComponent(productId)}`);

  return normalizeProduct(product);
}
