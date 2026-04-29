import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  clearLegacyUserData,
  clearStoredAuthUser,
  clearStoredAuthToken,
  clearStoredOpeningLocation,
  getStoredAuthToken,
  getStoredAuthUser,
  getStoredLocationCompleted,
  getStoredOnboardingCompleted,
  getStoredOpeningLocation,
  migrateLegacyLocationState,
  storeAuthToken,
  storeAuthUser,
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

async function getResolvedLocationState(user) {
  if (!user) {
    return {
      hasCompletedLocation: false,
      location: null,
    };
  }

  await migrateLegacyLocationState(user);

  const [storedLocationCompleted, storedOpeningLocation] = await Promise.all([
    getStoredLocationCompleted(user),
    getStoredOpeningLocation(user),
  ]);

  const resolvedLocation = storedOpeningLocation || user.location || null;

  return {
    hasCompletedLocation: storedLocationCompleted || Boolean(resolvedLocation),
    location: resolvedLocation,
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

  function clearInMemorySession() {
    setApiAuthToken('');
    setAuthToken('');
    setBaseCurrentUser(null);
    setHasCompletedLocationSetup(false);
    setOpeningFlow(getInitialOpeningFlow());
  }

  useEffect(() => {
    let isMounted = true;

    async function restoreAppState() {
      try {
        const storedOnboardingCompleted = await getStoredOnboardingCompleted();

        if (!isMounted) {
          return;
        }

        setHasCompletedOnboarding(storedOnboardingCompleted);

        const [storedToken, storedUser] = await Promise.all([
          getStoredAuthToken(),
          getStoredAuthUser(),
        ]);

        if (!storedToken) {
          if (storedUser) {
            await clearStoredAuthUser();
          }

          if (isMounted) {
            setHasCompletedLocationSetup(false);
            setOpeningFlow(getInitialOpeningFlow());
          }

          return;
        }

        setApiAuthToken(storedToken);

        const nextUser = storedUser || (await getCurrentUserProfile());
        const locationState = await getResolvedLocationState(nextUser);

        if (!storedUser) {
          await storeAuthUser(nextUser);
        }

        if (!isMounted) {
          return;
        }

        setAuthToken(storedToken);
        setBaseCurrentUser(nextUser);
        setHasCompletedLocationSetup(locationState.hasCompletedLocation);
        setOpeningFlow(getInitialOpeningFlow(locationState.location));
      } catch (error) {
        await Promise.all([clearStoredAuthToken(), clearStoredAuthUser()]);

        if (isMounted) {
          clearInMemorySession();
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

  async function applySession(
    nextSession,
    { forceLocationSelection = false } = {},
  ) {
    if (!nextSession?.token || !nextSession?.user) {
      throw new Error('The server returned an incomplete session.');
    }

    const nextLocationState = forceLocationSelection
      ? {
          hasCompletedLocation: false,
          location: null,
        }
      : await getResolvedLocationState(nextSession.user);

    setApiAuthToken(nextSession.token);
    setAuthToken(nextSession.token);
    setBaseCurrentUser(nextSession.user);
    setHasCompletedLocationSetup(nextLocationState.hasCompletedLocation);
    setOpeningFlow(getInitialOpeningFlow(nextLocationState.location));

    try {
      const storageTasks = [
        storeAuthToken(nextSession.token),
        storeAuthUser(nextSession.user),
      ];

      if (forceLocationSelection) {
        storageTasks.push(storeLocationCompleted(nextSession.user, false));
        storageTasks.push(clearStoredOpeningLocation(nextSession.user));
      }

      await Promise.all(storageTasks);
    } catch (error) {
      await Promise.all([clearStoredAuthToken(), clearStoredAuthUser()]);
      clearInMemorySession();
      throw error;
    }

    return nextSession.user;
  }

  async function signIn(credentials) {
    const nextSession = await signInWithEmail(credentials);
    return applySession(nextSession);
  }

  async function signUp(credentials) {
    const nextSession = await signUpWithEmail(credentials);
    return applySession(nextSession, {
      forceLocationSelection: true,
    });
  }

  async function refreshCurrentUser() {
    const user = await getCurrentUserProfile();
    setBaseCurrentUser(user);
    await storeAuthUser(user);
    return user;
  }

  async function updateCurrentUser(profileInput) {
    const result = await updateMyProfile(profileInput);
    setBaseCurrentUser(result.user);
    await storeAuthUser(result.user);
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

    if (!baseCurrentUser) {
      setOpeningFlow(currentValue => ({
        ...currentValue,
        selectedLocation: resolvedLocation,
      }));
      setHasCompletedLocationSetup(true);
      return;
    }

    await Promise.all([
      storeLocationCompleted(baseCurrentUser, true),
      storeOpeningLocation(baseCurrentUser, resolvedLocation),
    ]);

    setOpeningFlow(currentValue => ({
      ...currentValue,
      selectedLocation: resolvedLocation,
    }));
    setHasCompletedLocationSetup(true);
  }

  async function signOut() {
    try {
      await Promise.all([
        clearStoredAuthToken(),
        clearStoredAuthUser(),
        clearLegacyUserData(),
      ]);
    } finally {
      clearInMemorySession();
    }
  }

  const isAuthenticated = Boolean(authToken && baseCurrentUser);
  const isPreviewSession = Boolean(previewCurrentUser);

  const value = {
    authToken,
    completeCustomerOpeningFlow,
    completeOnboarding,
    completeOpeningVerification,
    currentUser,
    hasCompletedLocation: hasCompletedLocationSetup,
    hasCompletedLocationSetup,
    hasCompletedOnboarding,
    isAuthenticated,
    isAuthLoading: isInitializing,
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
    token: authToken,
    updateCurrentUser,
    user: currentUser,
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
