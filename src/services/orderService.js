import { apiRequest } from './apiClient';

function roundCurrencyAmount(value) {
  return Number(Number(value || 0).toFixed(2));
}

function buildLocalOrder(orderPayload = {}) {
  return {
    id: `local-order-${Date.now()}`,
    status: 'accepted',
    source: 'local-fallback',
    ...orderPayload,
    totalAmount: roundCurrencyAmount(orderPayload.totalAmount),
  };
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

export async function submitOrder(orderPayload) {
  try {
    const order = await createOrder(orderPayload);

    return {
      order,
      mode: 'api',
    };
  } catch (error) {
    return {
      order: buildLocalOrder(orderPayload),
      mode: 'local',
      fallbackReason: error.message || 'Could not reach order API.',
    };
  }
}
