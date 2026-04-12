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

  if (isAuthenticated && hasCompletedLocationSetup && role === ROLES.OWNER) {
    return (
      <NavigationContainer>
        <OwnerNavigator key={ROOT_ROUTES.OWNER_FLOW} />
      </NavigationContainer>
    );
  }

  const canShowCustomerApp = shouldShowCustomerApp({
    hasCompletedLocationSetup,
    isAuthenticated,
    isPreviewSession,
    role,
  });

  if (canShowCustomerApp) {
    return (
      <NavigationContainer>
        <CustomerNavigator key={ROOT_ROUTES.CUSTOMER_FLOW} />
      </NavigationContainer>
    );
  }

  const initialRouteName = getAuthInitialRouteName({
    hasCompletedLocationSetup,
    hasCompletedOnboarding,
    isAuthenticated,
  });
  const flowKey = `${ROOT_ROUTES.AUTH_FLOW}-${initialRouteName}`;

  return (
    <NavigationContainer>
      <AuthNavigator
        key={flowKey}
        initialRouteName={initialRouteName}
      />
    </NavigationContainer>
  );
}

export default AppNavigator;
