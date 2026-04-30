import {
  CALENDAR_EVENT_TITLE_PREFIX,
  DEFAULT_DELIVERY_REMINDER_DURATION_MINUTES,
  DEFAULT_FALLBACK_DELIVERY_DELAY_MINUTES,
  DEFAULT_DELIVERY_REMINDER_OFFSET_MINUTES,
} from '../config/calendarReminderConfig';
import {
  buildAddressFullText,
  normalizeOrderStatus,
} from './accountFormatting';
import { formatCurrency } from './formatCurrency';

const MINUTE_IN_MS = 60 * 1000;

function toValidDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function getOrderReference(order = {}) {
  return `${
    order?.id || order?.reference || order?.orderReference || ''
  }`.trim();
}

function getOrderItemCount(order = {}) {
  const numericItemCount = Number(order?.itemCount);

  if (Number.isFinite(numericItemCount) && numericItemCount > 0) {
    return numericItemCount;
  }

  if (!Array.isArray(order?.items)) {
    return 0;
  }

  return order.items.reduce(
    (sum, item) => sum + Number(item?.quantity || 0),
    0,
  );
}

function getOrderTotalLabel(order = {}) {
  const totalAmount = Number(
    order?.totalAmount ?? order?.total ?? order?.amount ?? NaN,
  );

  return Number.isFinite(totalAmount) ? formatCurrency(totalAmount) : '';
}

function getDeliveryLocation(order = {}) {
  return (
    buildAddressFullText(order?.deliveryAddressSnapshot) ||
    `${order?.address || ''}`.trim()
  );
}

function buildFallbackDeliveryWindow() {
  const startDate = new Date(
    Date.now() + DEFAULT_FALLBACK_DELIVERY_DELAY_MINUTES * MINUTE_IN_MS,
  );
  const endDate = new Date(
    startDate.getTime() +
      DEFAULT_DELIVERY_REMINDER_DURATION_MINUTES * MINUTE_IN_MS,
  );

  return { startDate, endDate };
}

function getDeliveryWindow(order = {}) {
  const deliveryWindow = order?.deliveryWindow;

  if (deliveryWindow && typeof deliveryWindow === 'object') {
    const startDate = toValidDate(
      deliveryWindow.startAt || deliveryWindow.startDate || deliveryWindow.from,
    );
    const endDate = toValidDate(
      deliveryWindow.endAt || deliveryWindow.endDate || deliveryWindow.to,
    );

    if (startDate && endDate) {
      return { startDate, endDate };
    }

    if (startDate) {
      return {
        startDate,
        endDate: new Date(
          startDate.getTime() +
            DEFAULT_DELIVERY_REMINDER_DURATION_MINUTES * MINUTE_IN_MS,
        ),
      };
    }
  }

  const fallbackStartDate = toValidDate(
    order?.deliveryAt || order?.deliveryDate || order?.estimatedDeliveryAt,
  );

  if (fallbackStartDate) {
    return {
      startDate: fallbackStartDate,
      endDate: new Date(
        fallbackStartDate.getTime() +
          DEFAULT_DELIVERY_REMINDER_DURATION_MINUTES * MINUTE_IN_MS,
      ),
    };
  }

  return buildFallbackDeliveryWindow();
}

function buildEventDescription({
  deliveryLocation,
  itemCount,
  orderReference,
  statusLabel,
  totalLabel,
}) {
  const lines = [];

  if (orderReference) {
    lines.push(`Order reference: ${orderReference}`);
  }

  if (totalLabel) {
    lines.push(`Total: ${totalLabel}`);
  }

  if (itemCount > 0) {
    lines.push(`Items: ${itemCount}`);
  }

  lines.push(`Status: ${statusLabel}`);

  if (deliveryLocation) {
    lines.push(`Delivery address: ${deliveryLocation}`);
  }

  return lines.join('\n');
}

function buildReminderAlarms(startDate) {
  return [
    {
      date: new Date(
        startDate.getTime() -
          DEFAULT_DELIVERY_REMINDER_OFFSET_MINUTES * MINUTE_IN_MS,
      ).toISOString(),
    },
  ];
}

export function buildDeliveryCalendarEvent(order = {}) {
  const orderReference = getOrderReference(order);
  const itemCount = getOrderItemCount(order);
  const totalLabel = getOrderTotalLabel(order);
  const deliveryLocation = getDeliveryLocation(order);
  const statusLabel = normalizeOrderStatus(order?.status || 'processing');
  const { startDate, endDate } = getDeliveryWindow(order);
  const description = buildEventDescription({
    deliveryLocation,
    itemCount,
    orderReference,
    statusLabel,
    totalLabel,
  });

  return {
    title: CALENDAR_EVENT_TITLE_PREFIX,
    description,
    notes: description,
    location: deliveryLocation || '',
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    alarms: buildReminderAlarms(startDate),
    reminderOffsetMinutes: DEFAULT_DELIVERY_REMINDER_OFFSET_MINUTES,
    orderReference,
  };
}
