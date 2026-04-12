import { DEMO_PRODUCTS } from './demoProducts';
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

function buildAddressSnapshot(address) {
  return {
    id: address?.id || null,
    label: address?.label || 'Delivery address',
    recipientName: address?.recipientName || '',
    phoneNumber: address?.phoneNumber || '',
    addressLine: address?.addressLine || '',
    area: address?.area || '',
    notes: address?.notes || '',
    fullAddress: buildAddressFullText(address),
  };
}

function buildPaymentSnapshot(method) {
  return {
    id: method?.id || null,
    type: method?.type || 'cash',
    title: formatPaymentMethodTitle(method),
    meta: formatPaymentMethodMeta(method),
    label: method?.label || 'Cash on Delivery',
    brand: method?.brand || '',
    last4: method?.last4 || '',
  };
}

function buildOrderItems(lines) {
  return lines
    .map(line => {
      const product = getProductById(line.productId);

      if (!product) {
        return null;
      }

      return {
        id: `${line.productId}-${line.quantity}`,
        productId: product.id,
        name: product.name,
        quantity: line.quantity,
        price: product.price,
        product,
      };
    })
    .filter(Boolean);
}

function createMockOrder({
  id,
  createdAt,
  status,
  lines,
  address,
  paymentMethod,
  deliveryFee = 0,
  source = 'mock-history',
}) {
  const items = buildOrderItems(lines);
  const subtotal = roundCurrencyAmount(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    id,
    createdAt,
    status: normalizeOrderStatus(status),
    items,
    itemCount,
    subtotal,
    deliveryFee: roundCurrencyAmount(deliveryFee),
    totalAmount: roundCurrencyAmount(subtotal + deliveryFee),
    deliveryAddressSnapshot: buildAddressSnapshot(address),
    paymentMethodSnapshot: buildPaymentSnapshot(paymentMethod),
    submitMode: 'mock',
    source,
  };
}

function getSeedArea(currentUser, openingFlow) {
  return (
    currentUser?.location?.fullAddress ||
    currentUser?.location?.detail ||
    openingFlow?.selectedLocation?.fullAddress ||
    openingFlow?.selectedLocation?.detail ||
    currentUser?.deliveryAddress ||
    'District 1, Ho Chi Minh City'
  );
}

export const DEFAULT_NOTIFICATION_SETTINGS = Object.freeze({
  orderUpdates: true,
  promotions: false,
  deliveryReminders: true,
  restockAlerts: false,
});

export const NOTIFICATION_SETTING_OPTIONS = Object.freeze([
  {
    key: 'orderUpdates',
    title: 'Order updates',
    description: 'Status changes, delays and delivery confirmation.',
  },
  {
    key: 'promotions',
    title: 'Promotions',
    description: 'Weekend offers, bundles and featured seasonal picks.',
  },
  {
    key: 'deliveryReminders',
    title: 'Delivery reminders',
    description: 'Friendly nudges before your groceries arrive.',
  },
  {
    key: 'restockAlerts',
    title: 'Restock alerts',
    description: 'Be first to know when favourites are back on the shelf.',
  },
]);

export const HELP_FAQ_ITEMS = Object.freeze([
  {
    id: 'faq-delivery-window',
    question: 'How long does delivery usually take?',
    answer:
      'For the demo flow, same-day orders usually arrive within 30 to 60 minutes depending on your area and item availability.',
  },
  {
    id: 'faq-cancel-order',
    question: 'Can I cancel or change an order?',
    answer:
      'Orders marked Processing can still be updated through support. Once an order is On the way, we can only help with delivery instructions.',
  },
  {
    id: 'faq-payment',
    question: 'Which payment methods are supported?',
    answer:
      'Grovy currently supports Cash on Delivery and saved cards for demo checkout. No live payment gateway is connected yet.',
  },
  {
    id: 'faq-missing-item',
    question: 'What if an item is missing or unavailable?',
    answer:
      'Support will help with a replacement or refund option if an item is missing, damaged or not available after packing.',
  },
]);

export const HELP_CONTACT_CHANNELS = Object.freeze([
  {
    id: 'support-email',
    title: 'Email support',
    value: 'support@grovy.app',
    description: 'Typical response time: within 2 hours for demo requests.',
  },
  {
    id: 'support-hotline',
    title: 'Hotline demo',
    value: '+84 28 7300 2468',
    description: 'Available daily from 8:00 AM to 9:00 PM.',
  },
  {
    id: 'support-chat',
    title: 'Chat support',
    value: 'Coming soon',
    description: 'Live in-app chat is planned for a future iteration.',
  },
]);

export const DELIVERY_POLICY_POINTS = Object.freeze([
  'Orders are packed after checkout confirmation and prioritized by delivery slot.',
  'Fresh produce is checked one more time before dispatch for demo quality control.',
  'If a courier cannot reach you, Grovy will attempt one follow-up call before rescheduling.',
]);

export const REFUND_POLICY_POINTS = Object.freeze([
  'Refunds are eligible for damaged, missing or incorrect items reported on the same day.',
  'Cash on Delivery issues are resolved as wallet credit or card refund in a live version.',
  'For this MVP, refunds are represented as support-assisted cases without backend settlement.',
]);

export const ABOUT_GROVY_CONTENT = Object.freeze({
  appName: 'Grovy',
  version: 'v0.4.0-demo',
  description:
    'A warm, fast grocery shopping MVP focused on simple browsing, smooth checkout and approachable everyday essentials.',
  mission:
    'Grovy exists to make routine grocery runs feel lighter, faster and a little more human for busy households.',
  whyGrovy: [
    'Fresh staples, pantry basics and delivery preferences in one easy flow.',
    'Friendly design language that feels calm instead of transactional.',
    'Built as a practical product demo with room to grow into real operations.',
  ],
  credits: [
    'Customer experience prototype by the Grovy product and engineering demo team.',
    'Designed to showcase checkout, account management and reusable grocery flows.',
  ],
});

export function buildInitialAddresses({ currentUser, openingFlow }) {
  const displayName = currentUser?.name || 'Demo Customer';
  const phoneNumber = currentUser?.phone || '+84 938 555 010';
  const seededArea = getSeedArea(currentUser, openingFlow);

  return [
    {
      id: 'address-home',
      label: 'Home',
      recipientName: displayName,
      phoneNumber,
      addressLine: 'Apartment 12A, Riverside Residence',
      area: seededArea,
      notes: 'Leave at the lobby if I miss the call.',
      isDefault: true,
    },
    {
      id: 'address-office',
      label: 'Office',
      recipientName: displayName,
      phoneNumber,
      addressLine: 'Floor 8, Lotus Tower',
      area: 'Binh Thanh District, Ho Chi Minh City',
      notes: 'Reception desk accepts parcels until 6 PM.',
      isDefault: false,
    },
  ];
}

export function buildInitialPaymentMethods({ currentUser }) {
  return [
    {
      id: 'payment-cash',
      type: 'cash',
      label: 'Cash on Delivery',
      description: 'Pay when your groceries arrive.',
      isDefault: true,
    },
    {
      id: 'payment-card-4242',
      type: 'card',
      label: 'Personal card',
      brand: 'Visa',
      cardholderName: currentUser?.name || 'Demo Customer',
      last4: '4242',
      expiry: '09/28',
      isDefault: false,
    },
  ];
}

export function buildInitialOrders({ addresses, paymentMethods }) {
  const defaultAddress = addresses.find(address => address.isDefault) || addresses[0];
  const officeAddress = addresses.find(address => address.label === 'Office') || defaultAddress;
  const cashMethod =
    paymentMethods.find(method => method.type === 'cash') || paymentMethods[0];
  const cardMethod =
    paymentMethods.find(method => method.type === 'card') || paymentMethods[0];

  return [
    createMockOrder({
      id: 'GRV-240411-1024',
      createdAt: '2026-04-11T10:24:00.000Z',
      status: 'On the way',
      address: defaultAddress,
      paymentMethod: cashMethod,
      lines: [
        { productId: 'grovy-apple-001', quantity: 2 },
        { productId: 'grovy-banana-001', quantity: 2 },
        { productId: 'grovy-orange-juice-001', quantity: 1 },
      ],
    }),
    createMockOrder({
      id: 'GRV-240409-0915',
      createdAt: '2026-04-09T09:15:00.000Z',
      status: 'Processing',
      address: officeAddress,
      paymentMethod: cardMethod,
      lines: [
        { productId: 'grovy-pasta-001', quantity: 2 },
        { productId: 'grovy-shimla-pepper-001', quantity: 2 },
        { productId: 'grovy-apple-juice-001', quantity: 1 },
      ],
    }),
    createMockOrder({
      id: 'GRV-240322-1840',
      createdAt: '2026-03-22T18:40:00.000Z',
      status: 'Delivered',
      address: defaultAddress,
      paymentMethod: cashMethod,
      lines: [
        { productId: 'grovy-egg-noodles-001', quantity: 2 },
        { productId: 'grovy-classic-cola-001', quantity: 4 },
      ],
    }),
    createMockOrder({
      id: 'GRV-240214-1548',
      createdAt: '2026-02-14T15:48:00.000Z',
      status: 'Cancelled',
      address: officeAddress,
      paymentMethod: cardMethod,
      lines: [
        { productId: 'grovy-apple-gala-001', quantity: 1 },
        { productId: 'grovy-orange-juice-mini-001', quantity: 2 },
      ],
    }),
  ].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
}
