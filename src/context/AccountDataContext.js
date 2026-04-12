import React, { createContext, useContext, useMemo, useReducer } from 'react';
import { useApp } from './AppContext';
import {
  buildInitialAddresses,
  buildInitialOrders,
  buildInitialPaymentMethods,
  DEFAULT_NOTIFICATION_SETTINGS,
} from '../data/accountMockData';
import {
  buildAddressFullText,
  detectCardBrand,
  formatPaymentMethodMeta,
  formatPaymentMethodTitle,
  normalizeOrderStatus,
} from '../utils/accountFormatting';

const AccountDataContext = createContext(null);

function roundCurrencyAmount(value) {
  return Number(Number(value || 0).toFixed(2));
}

function createLocalId(prefix) {
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

function sortAddresses(addresses) {
  return [...addresses].sort((left, right) => {
    if (left.isDefault !== right.isDefault) {
      return left.isDefault ? -1 : 1;
    }

    return left.label.localeCompare(right.label);
  });
}

function sortPaymentMethods(paymentMethods) {
  return [...paymentMethods].sort((left, right) => {
    if (left.isDefault !== right.isDefault) {
      return left.isDefault ? -1 : 1;
    }

    if (left.type !== right.type) {
      return left.type === 'cash' ? -1 : 1;
    }

    return (left.label || '').localeCompare(right.label || '');
  });
}

function ensureCollectionDefault(items) {
  if (!items.length || items.some(item => item.isDefault)) {
    return items;
  }

  return items.map((item, index) =>
    index === 0 ? { ...item, isDefault: true } : item,
  );
}

function buildAddressSnapshot(address, overrides = {}) {
  const addressLine = overrides.addressLine || address?.addressLine || '';
  const area = overrides.area || address?.area || '';

  return {
    id: address?.id || null,
    label: overrides.label || address?.label || 'Delivery address',
    recipientName:
      overrides.recipientName || address?.recipientName || 'Grovy customer',
    phoneNumber: overrides.phoneNumber || address?.phoneNumber || '',
    addressLine,
    area,
    notes:
      Object.prototype.hasOwnProperty.call(overrides, 'notes')
        ? overrides.notes
        : address?.notes || '',
    fullAddress:
      overrides.fullAddress ||
      buildAddressFullText({
        addressLine,
        area,
      }),
  };
}

function buildPaymentSnapshot(method) {
  return {
    id: method?.id || null,
    type: method?.type || 'cash',
    title: formatPaymentMethodTitle(method),
    meta: formatPaymentMethodMeta(method),
    label: method?.label || 'Cash on Delivery',
    brand: method?.brand || '',
    last4: method?.last4 || '',
  };
}

function buildOrderFromCheckout({
  apiOrder,
  cartItems,
  customerName,
  phoneNumber,
  addressText,
  addressRecord,
  paymentMethod,
  deliveryFee = 0,
  submitMode = 'local',
  fallbackReason = '',
}) {
  const items = cartItems.map(item => ({
    id: `${apiOrder?.id || 'new-order'}-${item.product.id}`,
    productId: item.product.id,
    name: item.product.name,
    quantity: item.quantity,
    price: item.product.price,
    product: item.product,
  }));
  const subtotal = roundCurrencyAmount(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const fullAddress = `${addressText || ''}`.trim();

  return {
    id: apiOrder?.id || createLocalId('GRV'),
    createdAt: apiOrder?.createdAt || new Date().toISOString(),
    status: normalizeOrderStatus(apiOrder?.status || 'processing'),
    items,
    itemCount,
    subtotal,
    deliveryFee: roundCurrencyAmount(deliveryFee),
    totalAmount: roundCurrencyAmount(
      apiOrder?.totalAmount ?? subtotal + deliveryFee,
    ),
    deliveryAddressSnapshot: buildAddressSnapshot(addressRecord, {
      recipientName: customerName,
      phoneNumber,
      fullAddress,
    }),
    paymentMethodSnapshot: buildPaymentSnapshot(paymentMethod),
    submitMode,
    fallbackReason,
    source: submitMode === 'api' ? 'checkout-api' : 'checkout-local',
  };
}

function accountDataReducer(state, action) {
  switch (action.type) {
    case 'ADD_ORDER': {
      const nextOrders = [action.payload, ...state.orders].sort(
        (left, right) => new Date(right.createdAt) - new Date(left.createdAt),
      );

      return {
        ...state,
        orders: nextOrders,
      };
    }
    case 'UPSERT_ADDRESS': {
      const nextAddress = action.payload;
      const hasExistingAddress = state.addresses.some(
        address => address.id === nextAddress.id,
      );
      const updatedAddresses = hasExistingAddress
        ? state.addresses.map(address =>
            address.id === nextAddress.id ? nextAddress : address,
          )
        : [...state.addresses, nextAddress];
      const defaultReadyAddresses = nextAddress.isDefault
        ? updatedAddresses.map(address => ({
            ...address,
            isDefault: address.id === nextAddress.id,
          }))
        : ensureCollectionDefault(updatedAddresses);

      return {
        ...state,
        addresses: sortAddresses(defaultReadyAddresses),
      };
    }
    case 'DELETE_ADDRESS': {
      const nextAddresses = state.addresses.filter(
        address => address.id !== action.payload.addressId,
      );

      return {
        ...state,
        addresses: sortAddresses(ensureCollectionDefault(nextAddresses)),
      };
    }
    case 'SET_DEFAULT_ADDRESS':
      return {
        ...state,
        addresses: sortAddresses(
          state.addresses.map(address => ({
            ...address,
            isDefault: address.id === action.payload.addressId,
          })),
        ),
      };
    case 'ADD_PAYMENT_METHOD': {
      const nextMethod = action.payload;
      const nextPaymentMethods = nextMethod.isDefault
        ? state.paymentMethods.map(method => ({
            ...method,
            isDefault: false,
          }))
        : [...state.paymentMethods];

      return {
        ...state,
        paymentMethods: sortPaymentMethods([
          ...nextPaymentMethods,
          nextMethod,
        ]),
      };
    }
    case 'DELETE_PAYMENT_METHOD': {
      const nextPaymentMethods = state.paymentMethods.filter(
        method => method.id !== action.payload.paymentMethodId,
      );

      return {
        ...state,
        paymentMethods: sortPaymentMethods(
          ensureCollectionDefault(nextPaymentMethods),
        ),
      };
    }
    case 'SET_DEFAULT_PAYMENT_METHOD':
      return {
        ...state,
        paymentMethods: sortPaymentMethods(
          state.paymentMethods.map(method => ({
            ...method,
            isDefault: method.id === action.payload.paymentMethodId,
          })),
        ),
      };
    case 'UPDATE_NOTIFICATION_SETTING':
      return {
        ...state,
        notificationSettings: {
          ...state.notificationSettings,
          [action.payload.key]: action.payload.value,
        },
      };
    default:
      return state;
  }
}

function buildInitialState({ currentUser, openingFlow }) {
  const addresses =
    Array.isArray(currentUser?.addresses) && currentUser.addresses.length > 0
      ? currentUser.addresses
      : buildInitialAddresses({ currentUser, openingFlow });
  const paymentMethods =
    Array.isArray(currentUser?.paymentMethods) &&
    currentUser.paymentMethods.length > 0
      ? currentUser.paymentMethods
      : buildInitialPaymentMethods({ currentUser });

  return {
    orders: buildInitialOrders({ addresses, paymentMethods }),
    addresses: sortAddresses(addresses),
    paymentMethods: sortPaymentMethods(paymentMethods),
    notificationSettings: {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      ...(currentUser?.notificationSettings || {}),
    },
  };
}

export function AccountDataProvider({ children }) {
  const { currentUser, openingFlow } = useApp();
  const [state, dispatch] = useReducer(
    accountDataReducer,
    { currentUser, openingFlow },
    buildInitialState,
  );

  const defaultAddress = useMemo(
    () => state.addresses.find(address => address.isDefault) || null,
    [state.addresses],
  );
  const defaultPaymentMethod = useMemo(
    () =>
      state.paymentMethods.find(paymentMethod => paymentMethod.isDefault) || null,
    [state.paymentMethods],
  );

  const value = {
    orders: state.orders,
    addresses: state.addresses,
    paymentMethods: state.paymentMethods,
    notificationSettings: state.notificationSettings,
    defaultAddress,
    defaultPaymentMethod,
    getOrderById: orderId =>
      state.orders.find(order => order.id === orderId) || null,
    saveAddress: addressInput => {
      const nextAddress = {
        id: addressInput.id || createLocalId('address'),
        label: `${addressInput.label || ''}`.trim() || 'Saved address',
        recipientName: `${addressInput.recipientName || ''}`.trim(),
        phoneNumber: `${addressInput.phoneNumber || ''}`.trim(),
        addressLine: `${addressInput.addressLine || ''}`.trim(),
        area: `${addressInput.area || ''}`.trim(),
        notes: `${addressInput.notes || ''}`.trim(),
        isDefault: Boolean(addressInput.isDefault),
      };

      dispatch({
        type: 'UPSERT_ADDRESS',
        payload: nextAddress,
      });

      return nextAddress;
    },
    deleteAddress: addressId =>
      dispatch({
        type: 'DELETE_ADDRESS',
        payload: { addressId },
      }),
    setDefaultAddress: addressId =>
      dispatch({
        type: 'SET_DEFAULT_ADDRESS',
        payload: { addressId },
      }),
    addPaymentMethod: ({
      cardholderName,
      cardNumber,
      expiry,
      isDefault = false,
      label = 'Saved card',
    }) => {
      const digits = `${cardNumber || ''}`.replace(/\D/g, '');
      const nextPaymentMethod = {
        id: createLocalId('payment-card'),
        type: 'card',
        label,
        brand: detectCardBrand(digits),
        cardholderName: `${cardholderName || ''}`.trim(),
        last4: digits.slice(-4),
        expiry: `${expiry || ''}`.trim(),
        isDefault,
      };

      dispatch({
        type: 'ADD_PAYMENT_METHOD',
        payload: nextPaymentMethod,
      });

      return nextPaymentMethod;
    },
    deletePaymentMethod: paymentMethodId =>
      dispatch({
        type: 'DELETE_PAYMENT_METHOD',
        payload: { paymentMethodId },
      }),
    setDefaultPaymentMethod: paymentMethodId =>
      dispatch({
        type: 'SET_DEFAULT_PAYMENT_METHOD',
        payload: { paymentMethodId },
      }),
    updateNotificationSetting: (key, nextValue) =>
      dispatch({
        type: 'UPDATE_NOTIFICATION_SETTING',
        payload: { key, value: nextValue },
      }),
    addCheckoutOrder: checkoutInput => {
      const nextOrder = buildOrderFromCheckout(checkoutInput);

      dispatch({
        type: 'ADD_ORDER',
        payload: nextOrder,
      });

      return nextOrder;
    },
  };

  return (
    <AccountDataContext.Provider value={value}>
      {children}
    </AccountDataContext.Provider>
  );
}

export function useAccountData() {
  const context = useContext(AccountDataContext);

  if (!context) {
    throw new Error('useAccountData must be used inside AccountDataProvider');
  }

  return context;
}
