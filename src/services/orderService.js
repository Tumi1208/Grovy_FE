import { apiRequest } from './apiClient';
import { DEMO_PRODUCTS } from '../data/demoProducts';
import {
  buildAddressFullText,
  formatPaymentMethodMeta,
  formatPaymentMethodTitle,
  normalizeOrderStatus,
} from '../utils/accountFormatting';

function roundCurrencyAmount(value) {
  return Number(Number(value || 0).toFixed(2));
}

function getProductById(productId) {
  return DEMO_PRODUCTS.find(product => product.id === productId) || null;
}

function normalizeOrderItem(item, index) {
  const product = getProductById(item?.productId);

  return {
    id: `${item?.productId || 'order-item'}-${index}`,
    productId: item?.productId || '',
    name: item?.name || product?.name || 'Grovy item',
    quantity: Number(item?.quantity || 0),
    price: roundCurrencyAmount(item?.price),
    product,
  };
}

function normalizeAddressSnapshot(snapshot) {
  return {
    id: snapshot?.id || null,
    label: snapshot?.label || 'Delivery address',
    recipientName: snapshot?.recipientName || '',
    phoneNumber: snapshot?.phoneNumber || '',
    addressLine: snapshot?.addressLine || '',
    area: snapshot?.area || '',
    notes: snapshot?.notes || '',
    fullAddress: snapshot?.fullAddress || buildAddressFullText(snapshot),
  };
}

function normalizePaymentMethodSnapshot(snapshot) {
  return {
    id: snapshot?.id || null,
    type: snapshot?.type || 'cash',
    title: snapshot?.title || formatPaymentMethodTitle(snapshot),
    meta: snapshot?.meta || formatPaymentMethodMeta(snapshot),
    label: snapshot?.label || 'Cash on Delivery',
    brand: snapshot?.brand || '',
    last4: snapshot?.last4 || '',
  };
}

export function normalizeOrderRecord(order = {}) {
  const items = Array.isArray(order?.items)
    ? order.items.map(normalizeOrderItem)
    : [];
  const subtotal =
    typeof order?.subtotal === 'number'
      ? roundCurrencyAmount(order.subtotal)
      : roundCurrencyAmount(
          items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        );
  const deliveryFee = roundCurrencyAmount(order?.deliveryFee);

  return {
    id: order?.id || '',
    userId: order?.userId || null,
    createdAt: order?.createdAt || new Date().toISOString(),
    status: normalizeOrderStatus(order?.status || 'processing'),
    items,
    itemCount:
      typeof order?.itemCount === 'number'
        ? order.itemCount
        : items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal,
    deliveryFee,
    totalAmount:
      typeof order?.totalAmount === 'number'
        ? roundCurrencyAmount(order.totalAmount)
        : roundCurrencyAmount(subtotal + deliveryFee),
    deliveryAddressSnapshot: normalizeAddressSnapshot(
      order?.deliveryAddressSnapshot,
    ),
    paymentMethodSnapshot: normalizePaymentMethodSnapshot(
      order?.paymentMethodSnapshot,
    ),
    customerName: order?.customerName || '',
    phone: order?.phone || '',
    address: order?.address || '',
    source: 'backend-api',
  };
}

export function buildCreateOrderPayload({
  customerName,
  phone,
  address,
  cartItems,
  subtotal,
  totalAmount,
  deliveryFee = 0,
  addressSnapshot,
  paymentMethodSnapshot,
}) {
  return {
    customerName: customerName.trim(),
    phone: phone.trim(),
    address: address.trim(),
    items: cartItems.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
    })),
    subtotal: roundCurrencyAmount(subtotal),
    deliveryFee: roundCurrencyAmount(deliveryFee),
    totalAmount: roundCurrencyAmount(totalAmount),
    deliveryAddressSnapshot: {
      id: addressSnapshot?.id || null,
      label: addressSnapshot?.label || 'Delivery address',
      recipientName: customerName.trim(),
      phoneNumber: phone.trim(),
      addressLine: addressSnapshot?.addressLine || '',
      area: addressSnapshot?.area || '',
      notes: addressSnapshot?.notes || '',
      fullAddress:
        address.trim() || addressSnapshot?.fullAddress || buildAddressFullText(addressSnapshot),
    },
    paymentMethodSnapshot: {
      id: paymentMethodSnapshot?.id || null,
      type: paymentMethodSnapshot?.type || 'cash',
      title: formatPaymentMethodTitle(paymentMethodSnapshot),
      meta: formatPaymentMethodMeta(paymentMethodSnapshot),
      label: paymentMethodSnapshot?.label || 'Cash on Delivery',
      brand: paymentMethodSnapshot?.brand || '',
      last4: paymentMethodSnapshot?.last4 || '',
    },
  };
}

export async function listMyOrders() {
  const data = await apiRequest('/orders/me');

  return Array.isArray(data?.items)
    ? data.items.map(normalizeOrderRecord)
    : [];
}

export async function getMyOrderById(orderId) {
  const data = await apiRequest(`/orders/${encodeURIComponent(orderId)}`);

  return normalizeOrderRecord(data);
}

export function createOrder(orderPayload) {
  return apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(orderPayload),
  }).then(normalizeOrderRecord);
}

export function submitOrder(orderPayload) {
  return createOrder(orderPayload);
}
