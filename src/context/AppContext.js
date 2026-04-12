import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  clearStoredAuthToken,
  getStoredAuthToken,
  getStoredLocationCompleted,
  getStoredOnboardingCompleted,
  getStoredOpeningLocation,
  storeAuthToken,
  storeLocationCompleted,
  storeOnboardingCompleted,
  storeOpeningLocation,
} from '../services/authStorage';
import { getMockSession } from '../constants/mockSession';
import { ROLES } from '../constants/roles';
import { setApiAuthToken } from '../services/apiClient';
import {
  getCurrentUserProfile,
  signInWithEmail,
  signUpWithEmail,
  updateMyProfile,
} from '../services/authService';

const AppContext = createContext(null);
const DEFAULT_COUNTRY_CODE = '+84';
const INITIAL_OPENING_FLOW = Object.freeze({
  countryCode: DEFAULT_COUNTRY_CODE,
  phoneNumber: '',
  isVerificationComplete: false,
  verificationCode: '',
  selectedLocation: null,
});

function getInitialOpeningFlow(selectedLocation = null) {
  return {
    ...INITIAL_OPENING_FLOW,
    selectedLocation: selectedLocation ? { ...selectedLocation } : null,
  };
}

function buildPhonePreviewUser(openingFlow) {
  const previewSession = getMockSession('customerMvp');
  const previewUser = previewSession.currentUser || {};
  const resolvedLocation = openingFlow.selectedLocation
    ? { ...openingFlow.selectedLocation }
    : null;
  const resolvedPhone = [openingFlow.countryCode, openingFlow.phoneNumber]
    .filter(Boolean)
    .join(' ')
    .trim();

  return {
    ...previewUser,
    displayName: previewUser.displayName || previewUser.name || 'Phone Demo',
    name: previewUser.displayName || previewUser.name || 'Phone Demo',
    email: 'phone-preview@grovy.app',
    phone: resolvedPhone,
    avatarUrl: '',
    addresses: [],
    paymentMethods: [],
    deliveryAddress:
      resolvedLocation?.fullAddress || resolvedLocation?.detail || '',
    location: resolvedLocation,
    role: ROLES.CUSTOMER,
    isPreviewUser: true,
  };
}

export function AppProvider({ children }) {
  const [baseCurrentUser, setBaseCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [hasCompletedLocationSetup, setHasCompletedLocationSetup] =
    useState(false);
  const [openingFlow, setOpeningFlow] = useState(getInitialOpeningFlow);

  useEffect(() => {
    let isMounted = true;

    async function restoreAppState() {
      try {
        const [
          storedToken,
          storedOnboardingCompleted,
          storedLocationCompleted,
          storedOpeningLocation,
        ] = await Promise.all([
          getStoredAuthToken(),
          getStoredOnboardingCompleted(),
          getStoredLocationCompleted(),
          getStoredOpeningLocation(),
        ]);

        if (!isMounted) {
          return;
        }

        setHasCompletedOnboarding(storedOnboardingCompleted);
        setHasCompletedLocationSetup(storedLocationCompleted);
        setOpeningFlow(getInitialOpeningFlow(storedOpeningLocation));

        if (!storedToken) {
          return;
        }

        setApiAuthToken(storedToken);
        const user = await getCurrentUserProfile();

        if (!isMounted) {
          return;
        }

        setAuthToken(storedToken);
        setBaseCurrentUser(user);
      } catch (error) {
        setApiAuthToken('');
        await clearStoredAuthToken();

        if (isMounted) {
          setAuthToken('');
          setBaseCurrentUser(null);
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    }

    restoreAppState();

    return () => {
      isMounted = false;
    };
  }, []);

  const previewCurrentUser = useMemo(() => {
    if (baseCurrentUser || !openingFlow.isVerificationComplete) {
      return null;
    }

    return buildPhonePreviewUser(openingFlow);
  }, [baseCurrentUser, openingFlow]);

  const currentUser = useMemo(() => {
    const resolvedBaseUser = baseCurrentUser || previewCurrentUser;

    if (!resolvedBaseUser) {
      return null;
    }

    const resolvedLocation =
      openingFlow.selectedLocation || resolvedBaseUser.location || null;

    return {
      ...resolvedBaseUser,
      deliveryAddress:
        resolvedLocation?.fullAddress ||
        resolvedBaseUser.deliveryAddress ||
        '',
      location: resolvedLocation,
    };
  }, [baseCurrentUser, openingFlow.selectedLocation, previewCurrentUser]);

  async function applySession(nextSession) {
    setApiAuthToken(nextSession.token);
    await storeAuthToken(nextSession.token);
    setAuthToken(nextSession.token);
    setBaseCurrentUser(nextSession.user);

    return nextSession.user;
  }

  async function signIn(credentials) {
    const nextSession = await signInWithEmail(credentials);
    return applySession(nextSession);
  }

  async function signUp(credentials) {
    const nextSession = await signUpWithEmail(credentials);
    return applySession(nextSession);
  }

  async function refreshCurrentUser() {
    const user = await getCurrentUserProfile();
    setBaseCurrentUser(user);
    return user;
  }

  async function updateCurrentUser(profileInput) {
    const result = await updateMyProfile(profileInput);
    setBaseCurrentUser(result.user);
    return result;
  }

  async function completeOnboarding() {
    setHasCompletedOnboarding(true);
    await storeOnboardingCompleted(true);
  }

  function saveOpeningPhone({
    countryCode = DEFAULT_COUNTRY_CODE,
    phoneNumber,
  }) {
    setOpeningFlow(currentValue => ({
      ...currentValue,
      countryCode,
      phoneNumber,
      isVerificationComplete: false,
      verificationCode: '',
    }));
  }

  function completeOpeningVerification(code) {
    setOpeningFlow(currentValue => ({
      ...currentValue,
      isVerificationComplete: true,
      verificationCode: code,
    }));
  }

  function saveOpeningLocation(location) {
    setOpeningFlow(currentValue => ({
      ...currentValue,
      selectedLocation: location ? { ...location } : null,
    }));
  }

  async function completeCustomerOpeningFlow(locationOverride = null) {
    const resolvedLocation = locationOverride
      ? { ...locationOverride }
      : openingFlow.selectedLocation
        ? { ...openingFlow.selectedLocation }
        : null;

    saveOpeningLocation(resolvedLocation);
    setHasCompletedLocationSetup(true);
    await Promise.all([
      storeLocationCompleted(true),
      storeOpeningLocation(resolvedLocation),
    ]);
  }

  async function signOut() {
    const preservedLocation = openingFlow.selectedLocation;

    setApiAuthToken('');
    setAuthToken('');
    setBaseCurrentUser(null);
    setOpeningFlow(getInitialOpeningFlow(preservedLocation));
    await clearStoredAuthToken();
  }

  const isAuthenticated = Boolean(authToken && baseCurrentUser);
  const isPreviewSession = Boolean(previewCurrentUser);

  const value = {
    authToken,
    completeCustomerOpeningFlow,
    completeOnboarding,
    completeOpeningVerification,
    currentUser,
    hasCompletedLocationSetup,
    hasCompletedOnboarding,
    isAuthenticated,
    isInitializing,
    isPreviewSession,
    openingFlow,
    refreshCurrentUser,
    role: currentUser?.role || null,
    saveOpeningLocation,
    saveOpeningPhone,
    signIn,
    signOut,
    signUp,
    updateCurrentUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useApp must be used inside AppProvider');
  }

  return context;
}
