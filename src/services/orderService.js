import { apiRequest } from './apiClient';

export function createOrder(orderPayload) {
  return apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(orderPayload),
  });
}
