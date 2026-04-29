import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { useApp } from './AppContext';
import {
  buildInitialAddresses,
  buildInitialPaymentMethods,
  DEFAULT_NOTIFICATION_SETTINGS,
} from '../data/accountMockData';
import { listMyOrders } from '../services/orderService';
import {
  getStoredAccountData,
  getStoredOrders,
  getUserStorageScope,
  storeAccountData,
  storeOrders,
} from '../services/authStorage';
import { detectCardBrand } from '../utils/accountFormatting';

const AccountDataContext = createContext(null);

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

function accountDataReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE_STATE':
      return action.payload;
    case 'ADD_ORDER': {
      const nextOrders = [
        action.payload,
        ...state.orders.filter(order => order.id !== action.payload.id),
      ].sort(
        (left, right) => new Date(right.createdAt) - new Date(left.createdAt),
      );

      return {
        ...state,
        orders: nextOrders,
        ordersError: '',
      };
    }
    case 'LOAD_ORDERS_START':
      return {
        ...state,
        ordersLoading: true,
        ordersError: '',
      };
    case 'LOAD_ORDERS_SUCCESS':
      return {
        ...state,
        orders: action.payload,
        ordersLoading: false,
        ordersError: '',
      };
    case 'LOAD_ORDERS_ERROR':
      return {
        ...state,
        ordersLoading: false,
        ordersError: action.payload,
      };
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

function buildInitialState({
  currentUser,
  openingFlow,
  persistedAccountData = null,
  persistedOrders = null,
}) {
  const addresses = Array.isArray(persistedAccountData?.addresses)
    ? persistedAccountData.addresses
    : Array.isArray(currentUser?.addresses) && currentUser.addresses.length > 0
      ? currentUser.addresses
      : buildInitialAddresses({ currentUser, openingFlow });
  const paymentMethods = Array.isArray(persistedAccountData?.paymentMethods)
    ? persistedAccountData.paymentMethods
    : Array.isArray(currentUser?.paymentMethods) &&
        currentUser.paymentMethods.length > 0
      ? currentUser.paymentMethods
      : buildInitialPaymentMethods({ currentUser });

  return {
    orders: Array.isArray(persistedOrders) ? persistedOrders : [],
    ordersLoading: false,
    ordersError: '',
    addresses: sortAddresses(ensureCollectionDefault(addresses)),
    paymentMethods: sortPaymentMethods(
      ensureCollectionDefault(paymentMethods),
    ),
    notificationSettings: {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      ...(currentUser?.notificationSettings || {}),
      ...(persistedAccountData?.notificationSettings || {}),
    },
  };
}

export function AccountDataProvider({ children }) {
  const { currentUser, isPreviewSession, openingFlow } = useApp();
  const storageScope = currentUser?.isPreviewUser
    ? ''
    : getUserStorageScope(currentUser);
  const [state, dispatch] = useReducer(
    accountDataReducer,
    buildInitialState({ currentUser, openingFlow }),
  );
  const [isStorageHydrated, setIsStorageHydrated] = useState(false);
  const bootstrapStateRef = useRef({
    currentUser,
    openingFlow,
  });

  bootstrapStateRef.current = {
    currentUser,
    openingFlow,
  };

  const defaultAddress = useMemo(
    () => state.addresses.find(address => address.isDefault) || null,
    [state.addresses],
  );
  const defaultPaymentMethod = useMemo(
    () =>
      state.paymentMethods.find(paymentMethod => paymentMethod.isDefault) || null,
    [state.paymentMethods],
  );
  const persistedAccountSnapshot = useMemo(
    () => ({
      addresses: state.addresses,
      paymentMethods: state.paymentMethods,
      notificationSettings: state.notificationSettings,
    }),
    [state.addresses, state.notificationSettings, state.paymentMethods],
  );

  useEffect(() => {
    let isActive = true;

    async function restoreAccountState() {
      const bootstrapState = bootstrapStateRef.current;

      setIsStorageHydrated(false);

      try {
        const [persistedAccountData, persistedOrders] = storageScope
          ? await Promise.all([
              getStoredAccountData(storageScope),
              getStoredOrders(storageScope),
            ])
          : [null, []];

        if (!isActive) {
          return;
        }

        dispatch({
          type: 'HYDRATE_STATE',
          payload: buildInitialState({
            currentUser: bootstrapState.currentUser,
            openingFlow: bootstrapState.openingFlow,
            persistedAccountData,
            persistedOrders,
          }),
        });
      } catch {
        if (!isActive) {
          return;
        }

        dispatch({
          type: 'HYDRATE_STATE',
          payload: buildInitialState({
            currentUser: bootstrapState.currentUser,
            openingFlow: bootstrapState.openingFlow,
          }),
        });
      } finally {
        if (isActive) {
          setIsStorageHydrated(true);
        }
      }
    }

    restoreAccountState();

    return () => {
      isActive = false;
    };
  }, [storageScope]);

  useEffect(() => {
    if (!isStorageHydrated || !storageScope) {
      return;
    }

    Promise.all([
      storeAccountData(storageScope, persistedAccountSnapshot),
      storeOrders(storageScope, state.orders),
    ]).catch(() => {});
  }, [
    isStorageHydrated,
    persistedAccountSnapshot,
    state.orders,
    storageScope,
  ]);

  useEffect(() => {
    let isActive = true;

    async function loadOrders() {
      if (!currentUser?.id || currentUser?.isPreviewUser || isPreviewSession) {
        if (isActive) {
          dispatch({
            type: 'LOAD_ORDERS_SUCCESS',
            payload: [],
          });
        }

        return;
      }

      dispatch({ type: 'LOAD_ORDERS_START' });

      try {
        const nextOrders = await listMyOrders();

        if (!isActive) {
          return;
        }

        dispatch({
          type: 'LOAD_ORDERS_SUCCESS',
          payload: nextOrders,
        });
      } catch (error) {
        if (!isActive) {
          return;
        }

        dispatch({
          type: 'LOAD_ORDERS_ERROR',
          payload: error.message || 'Could not load your orders.',
        });
      }
    }

    loadOrders();

    return () => {
      isActive = false;
    };
  }, [currentUser?.id, currentUser?.isPreviewUser, isPreviewSession]);

  async function refreshOrders() {
    if (!currentUser?.id || currentUser?.isPreviewUser || isPreviewSession) {
      dispatch({
        type: 'LOAD_ORDERS_SUCCESS',
        payload: [],
      });
      return [];
    }

    dispatch({ type: 'LOAD_ORDERS_START' });

    try {
      const nextOrders = await listMyOrders();
      dispatch({
        type: 'LOAD_ORDERS_SUCCESS',
        payload: nextOrders,
      });
      return nextOrders;
    } catch (error) {
      dispatch({
        type: 'LOAD_ORDERS_ERROR',
        payload: error.message || 'Could not load your orders.',
      });
      throw error;
    }
  }

  const value = {
    orders: state.orders,
    ordersLoading: state.ordersLoading,
    ordersError: state.ordersError,
    addresses: state.addresses,
    paymentMethods: state.paymentMethods,
    notificationSettings: state.notificationSettings,
    defaultAddress,
    defaultPaymentMethod,
    refreshOrders,
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
    addCheckoutOrder: order => {
      dispatch({
        type: 'ADD_ORDER',
        payload: order,
      });

      return order;
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
