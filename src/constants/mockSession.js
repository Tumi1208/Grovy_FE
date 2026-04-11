import { ROLES } from './roles';

export const MOCK_SESSION_PRESETS = {
  signedOut: {
    currentUser: null,
    role: null,
    isAuthenticated: false,
  },
  customerMvp: {
    currentUser: {
      id: 'demo-customer-1',
      name: 'Demo Customer',
      role: ROLES.CUSTOMER,
    },
    role: ROLES.CUSTOMER,
    isAuthenticated: true,
  },
  ownerPreview: {
    currentUser: {
      id: 'demo-owner-1',
      name: 'Fresh Mart Owner',
      role: ROLES.OWNER,
      shopName: 'Fresh Mart',
    },
    role: ROLES.OWNER,
    isAuthenticated: true,
  },
};

// Default to signed out so the app opens through the MVP onboarding flow.
export const DEFAULT_SESSION_PRESET = 'signedOut';

export function getMockSession(presetKey = DEFAULT_SESSION_PRESET) {
  const preset = Object.prototype.hasOwnProperty.call(
    MOCK_SESSION_PRESETS,
    presetKey,
  )
    ? MOCK_SESSION_PRESETS[presetKey]
    : MOCK_SESSION_PRESETS[DEFAULT_SESSION_PRESET];

  return {
    ...preset,
    currentUser: preset.currentUser ? { ...preset.currentUser } : null,
  };
}
