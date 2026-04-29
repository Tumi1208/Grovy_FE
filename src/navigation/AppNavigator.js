import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppLoadingScreen from '../components/AppLoadingScreen';
import { AUTH_ROUTES, ROOT_ROUTES } from '../constants/routes';
import { ROLES } from '../constants/roles';
import { useApp } from '../context/AppContext';
import { getUserStorageScope } from '../services/authStorage';
import AuthNavigator from './AuthNavigator';
import CustomerNavigator from './CustomerNavigator';
import OwnerNavigator from './OwnerNavigator';

export function getAuthInitialRouteName({
  hasCompletedLocation,
  hasCompletedOnboarding,
  isAuthenticated,
}) {
  if (isAuthenticated && !hasCompletedLocation) {
    return AUTH_ROUTES.LOCATION;
  }

  if (!hasCompletedOnboarding) {
    return AUTH_ROUTES.SPLASH;
  }

  return AUTH_ROUTES.ENTRY;
}

export function shouldShowCustomerApp({
  hasCompletedLocation,
  isAuthenticated,
  isPreviewSession,
  role,
}) {
  return (
    hasCompletedLocation &&
    role === ROLES.CUSTOMER &&
    (isAuthenticated || isPreviewSession)
  );
}

function AppNavigator() {
  const {
    currentUser,
    hasCompletedLocation,
    hasCompletedOnboarding,
    isAuthenticated,
    isAuthLoading,
    isPreviewSession,
    role,
  } = useApp();

  if (isAuthLoading) {
    return <AppLoadingScreen />;
  }

  const userScope = getUserStorageScope(currentUser) || role || 'guest';
  let navigationKey = ROOT_ROUTES.AUTH_FLOW;
  let navigator = null;

  if (isAuthenticated && hasCompletedLocation && role === ROLES.OWNER) {
    navigationKey = `${ROOT_ROUTES.OWNER_FLOW}-${userScope}`;
    navigator = <OwnerNavigator key={navigationKey} />;
  }

  const canShowCustomerApp = shouldShowCustomerApp({
    hasCompletedLocation,
    isAuthenticated,
    isPreviewSession,
    role,
  });

  if (!navigator && canShowCustomerApp) {
    navigationKey = `${ROOT_ROUTES.CUSTOMER_FLOW}-${userScope}`;
    navigator = <CustomerNavigator key={navigationKey} />;
  }

  if (!navigator) {
    const initialRouteName = getAuthInitialRouteName({
      hasCompletedLocation,
      hasCompletedOnboarding,
      isAuthenticated,
    });
    const flowKey = `${ROOT_ROUTES.AUTH_FLOW}-${initialRouteName}-${userScope}`;
    navigationKey = flowKey;
    navigator = (
      <AuthNavigator
        key={flowKey}
        initialRouteName={initialRouteName}
      />
    );
  }

  return <NavigationContainer key={navigationKey}>{navigator}</NavigationContainer>;
}

export default AppNavigator;
