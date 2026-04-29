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
