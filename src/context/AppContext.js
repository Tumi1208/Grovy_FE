import React, { createContext, useContext, useState } from 'react';
import { getMockSession } from '../constants/mockSession';
import { ROLES } from '../constants/roles';

const AppContext = createContext(null);

function getPresetKeyForRole(role) {
  if (role === ROLES.OWNER) {
    return 'ownerPreview';
  }

  return 'customerMvp';
}

export function AppProvider({ children }) {
  const [session, setSession] = useState(() => getMockSession());

  function continueAsRole(role) {
    setSession(getMockSession(getPresetKeyForRole(role)));
  }

  function signOut() {
    setSession(getMockSession('signedOut'));
  }

  const value = {
    currentUser: session.currentUser,
    role: session.role,
    isAuthenticated: session.isAuthenticated,
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
