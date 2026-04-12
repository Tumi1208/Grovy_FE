import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_STORAGE_KEY = 'grovy.authToken';
const ONBOARDING_COMPLETED_STORAGE_KEY = 'grovy.hasCompletedOnboarding';
const LOCATION_COMPLETED_STORAGE_KEY = 'grovy.hasCompletedLocationSetup';
const OPENING_LOCATION_STORAGE_KEY = 'grovy.openingLocation';

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

async function getStoredBoolean(storageKey) {
  return (await AsyncStorage.getItem(storageKey)) === 'true';
}

async function storeBoolean(storageKey, value) {
  return AsyncStorage.setItem(storageKey, value ? 'true' : 'false');
}

export async function getStoredOnboardingCompleted() {
  return getStoredBoolean(ONBOARDING_COMPLETED_STORAGE_KEY);
}

export async function storeOnboardingCompleted(value) {
  return storeBoolean(ONBOARDING_COMPLETED_STORAGE_KEY, value);
}

export async function getStoredLocationCompleted() {
  return getStoredBoolean(LOCATION_COMPLETED_STORAGE_KEY);
}

export async function storeLocationCompleted(value) {
  return storeBoolean(LOCATION_COMPLETED_STORAGE_KEY, value);
}

export async function getStoredOpeningLocation() {
  const rawValue = await AsyncStorage.getItem(OPENING_LOCATION_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    await AsyncStorage.removeItem(OPENING_LOCATION_STORAGE_KEY);
    return null;
  }
}

export async function storeOpeningLocation(location) {
  if (!location) {
    return AsyncStorage.removeItem(OPENING_LOCATION_STORAGE_KEY);
  }

  return AsyncStorage.setItem(
    OPENING_LOCATION_STORAGE_KEY,
    JSON.stringify(location),
  );
}
