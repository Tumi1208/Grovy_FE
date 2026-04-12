function buildAddressSummary(address) {
  if (!address) {
    return '';
  }

  return [address.addressLine, address.area].filter(Boolean).join(', ').trim();
}

function getDefaultAddress(addresses = []) {
  return addresses.find(address => address.isDefault) || addresses[0] || null;
}

export function normalizeUserProfile(user) {
  if (!user) {
    return null;
  }

  const addresses = Array.isArray(user.addresses) ? user.addresses : [];
  const paymentMethods = Array.isArray(user.paymentMethods)
    ? user.paymentMethods
    : [];
  const defaultAddress = getDefaultAddress(addresses);
  const deliveryAddress = buildAddressSummary(defaultAddress);
  const locationLabel =
    defaultAddress?.area || defaultAddress?.label || 'HCMC, Vietnam';

  return {
    ...user,
    id: user.id || user._id || null,
    displayName: user.displayName || user.name || '',
    name: user.displayName || user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    avatarUrl: user.avatarUrl || '',
    addresses,
    paymentMethods,
    deliveryAddress,
    location: defaultAddress
      ? {
          detail: defaultAddress.addressLine || defaultAddress.area || '',
          fullAddress: deliveryAddress,
          label: locationLabel,
          shortLabel: locationLabel,
          source: 'account',
        }
      : null,
  };
}

export function getUserInitials(displayName = '') {
  const parts = `${displayName}`.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) {
    return 'G';
  }

  return parts
    .slice(0, 2)
    .map(part => part.slice(0, 1).toUpperCase())
    .join('');
}
