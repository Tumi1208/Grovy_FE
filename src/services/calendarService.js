import { PermissionsAndroid, Platform } from 'react-native';
import { buildDeliveryCalendarEvent } from '../utils/buildDeliveryCalendarEvent';

const CALENDAR_LIBRARY_NAME = 'react-native-calendar-events';
const ANDROID_CALENDAR_PERMISSIONS = {
  read: PermissionsAndroid.PERMISSIONS.READ_CALENDAR,
  write: PermissionsAndroid.PERMISSIONS.WRITE_CALENDAR,
};

function buildPermissionResult({
  granted,
  readGranted,
  reason = '',
  success = true,
  writeGranted,
}) {
  return {
    success,
    reason,
    granted,
    platform: Platform.OS,
    permissions: {
      read: readGranted,
      write: writeGranted,
    },
  };
}

function buildPlatformUnsupportedResult() {
  return buildPermissionResult({
    granted: false,
    readGranted: false,
    reason: 'PLATFORM_NOT_SUPPORTED',
    success: false,
    writeGranted: false,
  });
}

function isAndroidRuntimePermissionRequired() {
  return Platform.OS === 'android' && Number(Platform.Version) >= 23;
}

function isPermissionGranted(status) {
  return status === PermissionsAndroid.RESULTS.GRANTED;
}

export async function checkCalendarPermission() {
  if (Platform.OS !== 'android') {
    return buildPlatformUnsupportedResult();
  }

  if (!isAndroidRuntimePermissionRequired()) {
    return buildPermissionResult({
      granted: true,
      readGranted: true,
      writeGranted: true,
    });
  }

  try {
    const [readGranted, writeGranted] = await Promise.all([
      PermissionsAndroid.check(ANDROID_CALENDAR_PERMISSIONS.read),
      PermissionsAndroid.check(ANDROID_CALENDAR_PERMISSIONS.write),
    ]);

    return buildPermissionResult({
      granted: readGranted && writeGranted,
      readGranted,
      writeGranted,
    });
  } catch (error) {
    return {
      ...buildPermissionResult({
        granted: false,
        readGranted: false,
        reason: 'CALENDAR_PERMISSION_CHECK_FAILED',
        success: false,
        writeGranted: false,
      }),
      errorMessage: error?.message || 'Could not check calendar permissions.',
    };
  }
}

export async function requestCalendarPermission() {
  if (Platform.OS !== 'android') {
    return buildPlatformUnsupportedResult();
  }

  if (!isAndroidRuntimePermissionRequired()) {
    return buildPermissionResult({
      granted: true,
      readGranted: true,
      writeGranted: true,
    });
  }

  try {
    const statuses = await PermissionsAndroid.requestMultiple([
      ANDROID_CALENDAR_PERMISSIONS.read,
      ANDROID_CALENDAR_PERMISSIONS.write,
    ]);
    const readGranted = isPermissionGranted(
      statuses[ANDROID_CALENDAR_PERMISSIONS.read],
    );
    const writeGranted = isPermissionGranted(
      statuses[ANDROID_CALENDAR_PERMISSIONS.write],
    );

    return buildPermissionResult({
      granted: readGranted && writeGranted,
      readGranted,
      reason: readGranted && writeGranted ? '' : 'CALENDAR_PERMISSION_DENIED',
      writeGranted,
    });
  } catch (error) {
    return {
      ...buildPermissionResult({
        granted: false,
        readGranted: false,
        reason: 'CALENDAR_PERMISSION_REQUEST_FAILED',
        success: false,
        writeGranted: false,
      }),
      errorMessage: error?.message || 'Could not request calendar permissions.',
    };
  }
}

export async function createDeliveryCalendarReminder(order) {
  const eventPayload = buildDeliveryCalendarEvent(order);
  const permissionResult = await checkCalendarPermission();

  if (!permissionResult.success) {
    return {
      success: false,
      reason: permissionResult.reason || 'CALENDAR_PERMISSION_UNAVAILABLE',
      permissionResult,
      eventPayload,
    };
  }

  if (!permissionResult.granted) {
    return {
      success: false,
      reason: 'CALENDAR_PERMISSION_NOT_GRANTED',
      permissionResult,
      eventPayload,
    };
  }

  // Native calendar creation is deferred until the library is added.
  return {
    success: false,
    reason: 'CALENDAR_LIBRARY_NOT_CONFIGURED',
    recommendedDependency: CALENDAR_LIBRARY_NAME,
    permissionResult,
    eventPayload,
  };
}
