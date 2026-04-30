import { NativeModules, Platform } from 'react-native';
import RNCalendarEvents from 'react-native-calendar-events';
import { buildDeliveryCalendarEvent } from '../utils/buildDeliveryCalendarEvent';

const CALENDAR_LIBRARY_NAME = 'react-native-calendar-events';
const SUPPORTED_PLATFORMS = new Set(['android', 'ios']);

function getCalendarLibrary() {
  if (!NativeModules?.RNCalendarEvents) {
    return null;
  }

  if (
    typeof RNCalendarEvents?.checkPermissions !== 'function' ||
    typeof RNCalendarEvents?.requestPermissions !== 'function' ||
    typeof RNCalendarEvents?.saveEvent !== 'function'
  ) {
    return null;
  }

  return RNCalendarEvents;
}

function normalizePermissionStatus(status) {
  return `${status || ''}`.trim().toLowerCase();
}

function isPermissionAuthorized(status) {
  return normalizePermissionStatus(status) === 'authorized';
}

function buildPermissionResult({
  granted,
  message,
  reason = '',
  status = '',
  success = true,
}) {
  const result = {
    success,
    reason,
    granted,
    status,
    platform: Platform.OS,
  };

  if (message) {
    result.message = message;
  }

  return result;
}

function buildFailureResult({ eventPayload, message, reason }) {
  const result = {
    success: false,
    reason,
    eventPayload,
  };

  if (message) {
    result.message = message;
  }

  if (reason === 'CALENDAR_LIBRARY_NOT_CONFIGURED') {
    result.recommendedDependency = CALENDAR_LIBRARY_NAME;
  }

  return result;
}

function buildPermissionDeniedReason(status) {
  return status === 'undetermined' ? 'PERMISSION_UNDETERMINED' : 'PERMISSION_DENIED';
}

function buildSaveEventDetails(eventPayload) {
  return {
    alarms: Array.isArray(eventPayload?.alarms) ? eventPayload.alarms : [],
    description: eventPayload?.description || '',
    endDate: eventPayload?.endDate,
    location: eventPayload?.location || '',
    notes: eventPayload?.notes || '',
    startDate: eventPayload?.startDate,
  };
}

export async function checkCalendarPermission() {
  if (!SUPPORTED_PLATFORMS.has(Platform.OS)) {
    return buildPermissionResult({
      granted: false,
      reason: 'PLATFORM_NOT_SUPPORTED',
      success: false,
    });
  }

  const calendarLibrary = getCalendarLibrary();

  if (!calendarLibrary) {
    return buildPermissionResult({
      granted: false,
      reason: 'CALENDAR_LIBRARY_NOT_CONFIGURED',
      success: false,
    });
  }

  try {
    const status = normalizePermissionStatus(
      await calendarLibrary.checkPermissions(false),
    );
    const granted = isPermissionAuthorized(status);

    return buildPermissionResult({
      granted,
      reason: granted ? '' : buildPermissionDeniedReason(status),
      status,
    });
  } catch (error) {
    return buildPermissionResult({
      granted: false,
      message: error?.message || 'Could not check calendar permissions.',
      reason: 'UNKNOWN_ERROR',
      success: false,
    });
  }
}

export async function requestCalendarPermission() {
  if (!SUPPORTED_PLATFORMS.has(Platform.OS)) {
    return buildPermissionResult({
      granted: false,
      reason: 'PLATFORM_NOT_SUPPORTED',
      success: false,
    });
  }

  const calendarLibrary = getCalendarLibrary();

  if (!calendarLibrary) {
    return buildPermissionResult({
      granted: false,
      reason: 'CALENDAR_LIBRARY_NOT_CONFIGURED',
      success: false,
    });
  }

  try {
    const status = normalizePermissionStatus(
      await calendarLibrary.requestPermissions(false),
    );
    const granted = isPermissionAuthorized(status);

    return buildPermissionResult({
      granted,
      reason: granted ? '' : 'PERMISSION_DENIED',
      status,
    });
  } catch (error) {
    return buildPermissionResult({
      granted: false,
      message: error?.message || 'Could not request calendar permissions.',
      reason: 'UNKNOWN_ERROR',
      success: false,
    });
  }
}

export async function createDeliveryCalendarReminder(order) {
  const eventPayload = buildDeliveryCalendarEvent(order);
  const calendarLibrary = getCalendarLibrary();

  if (!calendarLibrary) {
    return buildFailureResult({
      eventPayload,
      reason: 'CALENDAR_LIBRARY_NOT_CONFIGURED',
    });
  }

  const permissionResult = await checkCalendarPermission();

  if (!permissionResult.success) {
    return buildFailureResult({
      eventPayload,
      message: permissionResult.message,
      reason: permissionResult.reason || 'UNKNOWN_ERROR',
    });
  }

  if (!permissionResult.granted) {
    const requestResult = await requestCalendarPermission();

    if (!requestResult.success) {
      return buildFailureResult({
        eventPayload,
        message: requestResult.message,
        reason: requestResult.reason || 'UNKNOWN_ERROR',
      });
    }

    if (!requestResult.granted) {
      return buildFailureResult({
        eventPayload,
        reason: 'PERMISSION_DENIED',
      });
    }
  }

  try {
    const eventId = await calendarLibrary.saveEvent(
      eventPayload.title,
      buildSaveEventDetails(eventPayload),
      Platform.OS === 'android' ? { sync: true } : undefined,
    );

    return {
      success: true,
      eventId,
      eventPayload,
    };
  } catch (error) {
    return buildFailureResult({
      eventPayload,
      message: error?.message || 'Could not create calendar reminder.',
      reason: 'UNKNOWN_ERROR',
    });
  }
}
