import { PermissionsAndroid, Platform } from 'react-native';

const LOCATION_TIMEOUT_MS = 12000;
const LOCATION_MAX_AGE_MS = 2000;
const ANDROID_LOCATION_PERMISSIONS = [
  PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
];

export const LOCATION_PERMISSION_STATUS = Object.freeze({
  BLOCKED: 'blocked',
  DENIED: 'denied',
  GRANTED: 'granted',
});

export const DEVICE_LOCATION_ERROR = Object.freeze({
  PERMISSION_DENIED: 'permission_denied',
  POSITION_UNAVAILABLE: 'position_unavailable',
  TIMEOUT: 'timeout',
  UNAVAILABLE: 'unavailable',
  UNKNOWN: 'unknown',
});

function formatCoordinate(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '';
  }

  return value.toFixed(4);
}

function buildCoordinateSummary(coords) {
  const latitude = formatCoordinate(coords?.latitude);
  const longitude = formatCoordinate(coords?.longitude);

  if (!latitude || !longitude) {
    return 'Current location detected';
  }

  return `Approx. ${latitude}, ${longitude}`;
}

function hasGrantedLocation(statusMap) {
  return Object.values(statusMap).some(
    value => value === PermissionsAndroid.RESULTS.GRANTED,
  );
}

function isBlockedLocation(statusMap) {
  return Object.values(statusMap).some(
    value => value === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
  );
}

function loadGeolocationModule() {
  try {
    const geolocationModule = require('@react-native-community/geolocation');

    return geolocationModule?.default || geolocationModule;
  } catch (error) {
    return null;
  }
}

function getConfiguredGeolocation() {
  const geolocation = loadGeolocationModule();

  if (!geolocation?.getCurrentPosition) {
    return null;
  }

  geolocation.setRNConfiguration?.({
    authorizationLevel: 'whenInUse',
    locationProvider: 'auto',
    skipPermissionRequests: true,
  });

  return geolocation;
}

export async function requestLocationPermission() {
  if (Platform.OS !== 'android') {
    return LOCATION_PERMISSION_STATUS.GRANTED;
  }

  const existingPermissionChecks = await Promise.all(
    ANDROID_LOCATION_PERMISSIONS.map(permission =>
      PermissionsAndroid.check(permission),
    ),
  );

  if (existingPermissionChecks.some(Boolean)) {
    return LOCATION_PERMISSION_STATUS.GRANTED;
  }

  const requestedPermissions = await PermissionsAndroid.requestMultiple(
    ANDROID_LOCATION_PERMISSIONS,
  );

  if (hasGrantedLocation(requestedPermissions)) {
    return LOCATION_PERMISSION_STATUS.GRANTED;
  }

  if (isBlockedLocation(requestedPermissions)) {
    return LOCATION_PERMISSION_STATUS.BLOCKED;
  }

  return LOCATION_PERMISSION_STATUS.DENIED;
}

function buildLocationError(error) {
  switch (error?.code) {
    case 1:
      return {
        type: DEVICE_LOCATION_ERROR.PERMISSION_DENIED,
        message: 'Location access is still off. You can enter it manually.',
      };
    case 2:
      return {
        type: DEVICE_LOCATION_ERROR.POSITION_UNAVAILABLE,
        message: 'We could not detect your location right now.',
      };
    case 3:
      return {
        type: DEVICE_LOCATION_ERROR.TIMEOUT,
        message: 'Finding your location took a bit too long. Try again or enter it manually.',
      };
    case 'unavailable':
      return {
        type: DEVICE_LOCATION_ERROR.UNAVAILABLE,
        message: 'Current location is not available in this build yet. Please enter it manually.',
      };
    default:
      return {
        type: DEVICE_LOCATION_ERROR.UNKNOWN,
        message: 'Something went off while checking your location. You can still type it in.',
      };
  }
}

export function getCurrentDeviceLocation() {
  return new Promise((resolve, reject) => {
    const geolocation = getConfiguredGeolocation();

    if (!geolocation) {
      reject(buildLocationError({ code: 'unavailable' }));
      return;
    }

    geolocation.getCurrentPosition(
      position => {
        const coords = position?.coords || {};
        const detail = buildCoordinateSummary(coords);

        resolve({
          coords: {
            latitude: coords.latitude,
            longitude: coords.longitude,
          },
          detail,
          fullAddress: detail,
          label: 'Using your current location',
          shortLabel: 'Current location',
          source: 'current',
        });
      },
      error => {
        reject(buildLocationError(error));
      },
      {
        enableHighAccuracy: true,
        maximumAge: LOCATION_MAX_AGE_MS,
        timeout: LOCATION_TIMEOUT_MS,
      },
    );
  });
}
