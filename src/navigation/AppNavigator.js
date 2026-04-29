import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppLoadingScreen from '../components/AppLoadingScreen';
import { AUTH_ROUTES, ROOT_ROUTES } from '../constants/routes';
import { ROLES } from '../constants/roles';
import { useApp } from '../context/AppContext';
import AuthNavigator from './AuthNavigator';
import CustomerNavigator from './CustomerNavigator';
import OwnerNavigator from './OwnerNavigator';

export function getAuthInitialRouteName({
  hasCompletedLocationSetup,
  hasCompletedOnboarding,
  isAuthenticated,
}) {
  if (!hasCompletedOnboarding) {
    return AUTH_ROUTES.SPLASH;
  }

  if (isAuthenticated && !hasCompletedLocationSetup) {
    return AUTH_ROUTES.LOCATION;
  }

  return AUTH_ROUTES.ENTRY;
}

export function shouldShowCustomerApp({
  hasCompletedLocationSetup,
  isAuthenticated,
  isPreviewSession,
  role,
}) {
  return (
    hasCompletedLocationSetup &&
    role === ROLES.CUSTOMER &&
    (isAuthenticated || isPreviewSession)
  );
}

function AppNavigator() {
  const {
    hasCompletedLocationSetup,
    hasCompletedOnboarding,
    isAuthenticated,
    isInitializing,
    isPreviewSession,
    role,
  } = useApp();

  if (isInitializing) {
    return <AppLoadingScreen />;
  }

  let navigationKey = ROOT_ROUTES.AUTH_FLOW;
  let navigator = null;

  if (isAuthenticated && hasCompletedLocationSetup && role === ROLES.OWNER) {
    navigationKey = ROOT_ROUTES.OWNER_FLOW;
    navigator = <OwnerNavigator key={ROOT_ROUTES.OWNER_FLOW} />;
  }

  const canShowCustomerApp = shouldShowCustomerApp({
    hasCompletedLocationSetup,
    isAuthenticated,
    isPreviewSession,
    role,
  });

  if (!navigator && canShowCustomerApp) {
    navigationKey = ROOT_ROUTES.CUSTOMER_FLOW;
    navigator = <CustomerNavigator key={ROOT_ROUTES.CUSTOMER_FLOW} />;
  }

  if (!navigator) {
    const initialRouteName = getAuthInitialRouteName({
      hasCompletedLocationSetup,
      hasCompletedOnboarding,
      isAuthenticated,
    });
    const flowKey = `${ROOT_ROUTES.AUTH_FLOW}-${initialRouteName}`;
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
