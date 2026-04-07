import { apiRequest } from './apiClient';
import { normalizeProduct } from '../utils/normalizeProduct';

const PRODUCTS_PATH = '/products';

export async function getProducts() {
  const data = await apiRequest(PRODUCTS_PATH);

  return Array.isArray(data?.items) ? data.items.map(normalizeProduct) : [];
}

export async function getProductDetailById(productId) {
  const normalizedProductId =
    typeof productId === 'string' ? productId.trim() : '';

  if (!normalizedProductId) {
    throw new Error('A product id is required to load product details.');
  }

  const product = await apiRequest(
    `${PRODUCTS_PATH}/${encodeURIComponent(normalizedProductId)}`,
  );

  return normalizeProduct(product);
}

export async function getProductById(productId) {
  return getProductDetailById(productId);
}
