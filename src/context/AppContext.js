import React, { createContext, useContext, useState } from 'react';
import { getMockSession } from '../constants/mockSession';
import { ROLES } from '../constants/roles';

const AppContext = createContext(null);
const DEFAULT_COUNTRY_CODE = '+84';
const INITIAL_OPENING_FLOW = Object.freeze({
  countryCode: DEFAULT_COUNTRY_CODE,
  phoneNumber: '',
  isVerificationComplete: false,
  verificationCode: '',
  selectedLocation: null,
});

function getPresetKeyForRole(role) {
  if (role === ROLES.OWNER) {
    return 'ownerPreview';
  }

  return 'customerMvp';
}

function getInitialOpeningFlow() {
  return {
    ...INITIAL_OPENING_FLOW,
  };
}

function buildCustomerSession(openingFlow) {
  const baseSession = getMockSession('customerMvp');
  const formattedPhone = [openingFlow.countryCode, openingFlow.phoneNumber]
    .filter(Boolean)
    .join(' ')
    .trim();
  const deliveryAddress =
    openingFlow.selectedLocation?.fullAddress ||
    openingFlow.selectedLocation?.detail ||
    openingFlow.selectedLocation?.label ||
    '';

  return {
    ...baseSession,
    currentUser: {
      ...baseSession.currentUser,
      phone: formattedPhone,
      deliveryAddress,
      location: openingFlow.selectedLocation
        ? { ...openingFlow.selectedLocation }
        : null,
    },
  };
}

export function AppProvider({ children }) {
  const [session, setSession] = useState(() => getMockSession());
  const [openingFlow, setOpeningFlow] = useState(getInitialOpeningFlow);

  function continueAsRole(role) {
    setOpeningFlow(getInitialOpeningFlow());
    setSession(getMockSession(getPresetKeyForRole(role)));
  }

  function resetOpeningFlow() {
    setOpeningFlow(getInitialOpeningFlow());
  }

  function saveOpeningPhone({ countryCode = DEFAULT_COUNTRY_CODE, phoneNumber }) {
    setOpeningFlow(currentValue => ({
      ...currentValue,
      countryCode,
      phoneNumber,
      isVerificationComplete: false,
      verificationCode: '',
      selectedLocation: null,
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

  function completeCustomerOpeningFlow(locationOverride = null) {
    const nextOpeningFlow = {
      ...openingFlow,
      selectedLocation: locationOverride
        ? { ...locationOverride }
        : openingFlow.selectedLocation,
    };

    setOpeningFlow(nextOpeningFlow);
    setSession(buildCustomerSession(nextOpeningFlow));
  }

  function signOut() {
    setOpeningFlow(getInitialOpeningFlow());
    setSession(getMockSession('signedOut'));
  }

  const value = {
    currentUser: session.currentUser,
    openingFlow,
    role: session.role,
    isAuthenticated: session.isAuthenticated,
    completeCustomerOpeningFlow,
    completeOpeningVerification,
    resetOpeningFlow,
    saveOpeningLocation,
    saveOpeningPhone,
    setSession,
    continueAsRole,
    signOut,
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
