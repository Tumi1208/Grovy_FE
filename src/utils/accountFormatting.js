function asTrimmedText(value) {
  return `${value || ''}`.trim();
}

export function buildAddressFullText(address) {
  if (!address) {
    return '';
  }

  const fullAddress = asTrimmedText(address.fullAddress);

  if (fullAddress) {
    return fullAddress;
  }

  return [address.addressLine, address.area].filter(Boolean).join(', ');
}

export function formatAddressContact(address) {
  if (!address) {
    return '';
  }

  return [address.recipientName, address.phoneNumber].filter(Boolean).join(' • ');
}

export function normalizeOrderStatus(value) {
  const normalizedValue = asTrimmedText(value).toLowerCase();

  if (!normalizedValue) {
    return 'Processing';
  }

  if (['delivered', 'completed'].includes(normalizedValue)) {
    return 'Delivered';
  }

  if (
    [
      'on the way',
      'on-the-way',
      'shipping',
      'in transit',
      'out for delivery',
    ].includes(normalizedValue)
  ) {
    return 'On the way';
  }

  if (['cancelled', 'canceled', 'failed'].includes(normalizedValue)) {
    return 'Cancelled';
  }

  return 'Processing';
}

const ORDER_STATUS_META = Object.freeze({
  Delivered: {
    backgroundColor: '#EEF6EC',
    borderColor: '#D8E7D2',
    textColor: '#4D7343',
  },
  Processing: {
    backgroundColor: '#F7F0E4',
    borderColor: '#E8D8BF',
    textColor: '#9B6A2E',
  },
  'On the way': {
    backgroundColor: '#EAF2E7',
    borderColor: '#D2E0CC',
    textColor: '#547A4E',
  },
  Cancelled: {
    backgroundColor: '#FAEDEC',
    borderColor: '#EBCFC8',
    textColor: '#C7674F',
  },
});

export function getOrderStatusMeta(status) {
  return ORDER_STATUS_META[normalizeOrderStatus(status)] || ORDER_STATUS_META.Processing;
}

export function formatOrderDate(value) {
  if (!value) {
    return 'Recently';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Recently';
  }

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function isRecentOrder(value, thresholdDays = 21) {
  if (!value) {
    return true;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return true;
  }

  const differenceInDays =
    Math.abs(Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);

  return differenceInDays <= thresholdDays;
}

export function detectCardBrand(value) {
  const digits = `${value || ''}`.replace(/\D/g, '');

  if (digits.startsWith('4')) {
    return 'Visa';
  }

  if (/^5[1-5]/.test(digits)) {
    return 'Mastercard';
  }

  if (/^3[47]/.test(digits)) {
    return 'Amex';
  }

  return 'Card';
}

export function formatCardNumberInput(value) {
  const digits = `${value || ''}`
    .replace(/\D/g, '')
    .slice(0, 19);

  return digits.replace(/(.{4})/g, '$1 ').trim();
}

export function formatExpiryInput(value) {
  const digits = `${value || ''}`
    .replace(/\D/g, '')
    .slice(0, 4);

  if (digits.length < 3) {
    return digits;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function formatPaymentMethodTitle(method) {
  if (!method) {
    return 'Cash on Delivery';
  }

  if (method.type === 'cash') {
    return 'Cash on Delivery';
  }

  const brand = asTrimmedText(method.brand) || 'Card';
  const last4 = asTrimmedText(method.last4);

  return `${brand} ending in ${last4 || '0000'}`;
}

export function formatPaymentMethodMeta(method) {
  if (!method) {
    return 'Pay when your groceries arrive.';
  }

  if (method.type === 'cash') {
    return method.description || 'Pay when your groceries arrive.';
  }

  return [method.cardholderName, method.expiry ? `Expires ${method.expiry}` : '']
    .filter(Boolean)
    .join(' • ');
}

export function formatPaymentMethodShortLabel(method) {
  if (!method || method.type === 'cash') {
    return 'Cash on delivery';
  }

  return `${method.brand || 'Card'} •••• ${method.last4 || '0000'}`;
}

export function normalizePhoneNumberInput(value) {
  return `${value || ''}`
    .replace(/[^0-9+ ]/g, '')
    .replace(/\s{2,}/g, ' ')
    .slice(0, 20)
    .trimStart();
}
