import { apiRequest } from './apiClient';

function roundCurrencyAmount(value) {
  return Number(Number(value || 0).toFixed(2));
}

export function buildCreateOrderPayload({
  customerId = null,
  customerName,
  phone,
  address,
  cartItems,
  totalAmount,
}) {
  return {
    customerId,
    customerName: customerName.trim(),
    phone: phone.trim(),
    address: address.trim(),
    items: cartItems.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
    })),
    totalAmount: roundCurrencyAmount(totalAmount),
  };
}

export function createOrder(orderPayload) {
  return apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(orderPayload),
  });
}
