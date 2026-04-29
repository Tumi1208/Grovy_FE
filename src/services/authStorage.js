import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_STORAGE_KEY = 'grovy.authToken';
const AUTH_USER_STORAGE_KEY = 'grovy.authUser';
const ONBOARDING_COMPLETED_STORAGE_KEY = 'grovy.hasCompletedOnboarding';

const LOCATION_COMPLETED_STORAGE_PREFIX = 'grovy_location_completed';
const LOCATION_STORAGE_PREFIX = 'grovy_location';
const CART_STORAGE_PREFIX = 'grovy_cart';
const SAVED_ITEMS_STORAGE_PREFIX = 'grovy_saved';
const ACCOUNT_DATA_STORAGE_PREFIX = 'grovy_account';
const ORDERS_STORAGE_PREFIX = 'grovy_orders';

const LEGACY_LOCATION_COMPLETED_STORAGE_KEY =
  'grovy.hasCompletedLocationSetup';
const LEGACY_OPENING_LOCATION_STORAGE_KEY = 'grovy.openingLocation';
const LEGACY_USER_DATA_STORAGE_KEYS = Object.freeze([
  'cart',
  'savedItems',
  'orders',
  'location',
  'hasSelectedLocation',
]);

function normalizeStorageScopeSegment(value) {
  return `${value || ''}`
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function getUserStorageScope(user) {
  if (!user) {
    return '';
  }

  const userId = user.id || user._id;

  if (userId) {
    return normalizeStorageScopeSegment(userId);
  }

  return normalizeStorageScopeSegment(user.email);
}

export function buildUserScopedStorageKey(prefix, user) {
  const scope =
    typeof user === 'string'
      ? normalizeStorageScopeSegment(user)
      : getUserStorageScope(user);

  return scope ? `${prefix}_${scope}` : '';
}

async function getParsedStorageItem(storageKey) {
  if (!storageKey) {
    return null;
  }

  const rawValue = await AsyncStorage.getItem(storageKey);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    await AsyncStorage.removeItem(storageKey);
    return null;
  }
}

async function storeParsedStorageItem(storageKey, value) {
  if (!storageKey) {
    return null;
  }

  if (value === null || value === undefined) {
    return AsyncStorage.removeItem(storageKey);
  }

  return AsyncStorage.setItem(storageKey, JSON.stringify(value));
}

async function getStoredBooleanValue(storageKey) {
  if (!storageKey) {
    return null;
  }

  const rawValue = await AsyncStorage.getItem(storageKey);

  if (rawValue === null) {
    return null;
  }

  return rawValue === 'true';
}

async function storeBooleanValue(storageKey, value) {
  if (!storageKey) {
    return null;
  }

  return AsyncStorage.setItem(storageKey, value ? 'true' : 'false');
}

export async function getStoredAuthToken() {
  return AsyncStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

export async function storeAuthToken(token) {
  if (!token) {
    return clearStoredAuthToken();
  }

  return AsyncStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
}

export async function clearStoredAuthToken() {
  return AsyncStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
}

export async function getStoredAuthUser() {
  return getParsedStorageItem(AUTH_USER_STORAGE_KEY);
}

export async function storeAuthUser(user) {
  if (!user) {
    return clearStoredAuthUser();
  }

  return storeParsedStorageItem(AUTH_USER_STORAGE_KEY, user);
}

export async function clearStoredAuthUser() {
  return AsyncStorage.removeItem(AUTH_USER_STORAGE_KEY);
}

export async function getStoredOnboardingCompleted() {
  return (await getStoredBooleanValue(ONBOARDING_COMPLETED_STORAGE_KEY)) === true;
}

export async function storeOnboardingCompleted(value) {
  return storeBooleanValue(ONBOARDING_COMPLETED_STORAGE_KEY, value);
}

export async function getStoredLocationCompleted(user) {
  return (
    (await getStoredBooleanValue(
      buildUserScopedStorageKey(LOCATION_COMPLETED_STORAGE_PREFIX, user),
    )) === true
  );
}

export async function storeLocationCompleted(user, value) {
  return storeBooleanValue(
    buildUserScopedStorageKey(LOCATION_COMPLETED_STORAGE_PREFIX, user),
    value,
  );
}

export async function clearStoredLocationCompleted(user) {
  const storageKey = buildUserScopedStorageKey(
    LOCATION_COMPLETED_STORAGE_PREFIX,
    user,
  );

  return storageKey ? AsyncStorage.removeItem(storageKey) : null;
}

export async function getStoredOpeningLocation(user) {
  return getParsedStorageItem(
    buildUserScopedStorageKey(LOCATION_STORAGE_PREFIX, user),
  );
}

export async function storeOpeningLocation(user, location) {
  return storeParsedStorageItem(
    buildUserScopedStorageKey(LOCATION_STORAGE_PREFIX, user),
    location,
  );
}

export async function clearStoredOpeningLocation(user) {
  const storageKey = buildUserScopedStorageKey(LOCATION_STORAGE_PREFIX, user);

  return storageKey ? AsyncStorage.removeItem(storageKey) : null;
}

export async function getStoredCart(user) {
  const value = await getParsedStorageItem(
    buildUserScopedStorageKey(CART_STORAGE_PREFIX, user),
  );

  return Array.isArray(value) ? value : [];
}

export async function storeCart(user, items) {
  return storeParsedStorageItem(
    buildUserScopedStorageKey(CART_STORAGE_PREFIX, user),
    Array.isArray(items) ? items : [],
  );
}

export async function getStoredSavedItems(user) {
  const value = await getParsedStorageItem(
    buildUserScopedStorageKey(SAVED_ITEMS_STORAGE_PREFIX, user),
  );

  return Array.isArray(value) ? value : [];
}

export async function storeSavedItems(user, items) {
  return storeParsedStorageItem(
    buildUserScopedStorageKey(SAVED_ITEMS_STORAGE_PREFIX, user),
    Array.isArray(items) ? items : [],
  );
}

export async function getStoredAccountData(user) {
  return getParsedStorageItem(
    buildUserScopedStorageKey(ACCOUNT_DATA_STORAGE_PREFIX, user),
  );
}

export async function storeAccountData(user, value) {
  return storeParsedStorageItem(
    buildUserScopedStorageKey(ACCOUNT_DATA_STORAGE_PREFIX, user),
    value,
  );
}

export async function getStoredOrders(user) {
  const value = await getParsedStorageItem(
    buildUserScopedStorageKey(ORDERS_STORAGE_PREFIX, user),
  );

  return Array.isArray(value) ? value : [];
}

export async function storeOrders(user, items) {
  return storeParsedStorageItem(
    buildUserScopedStorageKey(ORDERS_STORAGE_PREFIX, user),
    Array.isArray(items) ? items : [],
  );
}

export async function migrateLegacyLocationState(user) {
  const completedStorageKey = buildUserScopedStorageKey(
    LOCATION_COMPLETED_STORAGE_PREFIX,
    user,
  );
  const locationStorageKey = buildUserScopedStorageKey(
    LOCATION_STORAGE_PREFIX,
    user,
  );

  if (!completedStorageKey || !locationStorageKey) {
    return;
  }

  const [
    scopedCompletedValue,
    scopedLocationValue,
    legacyCompletedValue,
    legacyLocationValue,
  ] = await Promise.all([
    AsyncStorage.getItem(completedStorageKey),
    AsyncStorage.getItem(locationStorageKey),
    getStoredBooleanValue(LEGACY_LOCATION_COMPLETED_STORAGE_KEY),
    getParsedStorageItem(LEGACY_OPENING_LOCATION_STORAGE_KEY),
  ]);

  const tasks = [];

  if (scopedCompletedValue === null && legacyCompletedValue !== null) {
    tasks.push(storeBooleanValue(completedStorageKey, legacyCompletedValue));
  }

  if (scopedLocationValue === null && legacyLocationValue) {
    tasks.push(storeParsedStorageItem(locationStorageKey, legacyLocationValue));
  }

  if (legacyCompletedValue !== null || legacyLocationValue) {
    tasks.push(
      AsyncStorage.multiRemove([
        LEGACY_LOCATION_COMPLETED_STORAGE_KEY,
        LEGACY_OPENING_LOCATION_STORAGE_KEY,
      ]),
    );
  }

  if (tasks.length > 0) {
    await Promise.all(tasks);
  }
}

export async function clearLegacyUserData() {
  await AsyncStorage.multiRemove([
    ...LEGACY_USER_DATA_STORAGE_KEYS,
    LEGACY_LOCATION_COMPLETED_STORAGE_KEY,
    LEGACY_OPENING_LOCATION_STORAGE_KEY,
  ]);
}
