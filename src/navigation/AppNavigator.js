import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ROOT_ROUTES } from '../constants/routes';
import { ROLES } from '../constants/roles';
import { useApp } from '../context/AppContext';
import AuthNavigator from './AuthNavigator';
import CustomerNavigator from './CustomerNavigator';
import OwnerNavigator from './OwnerNavigator';

function AppNavigator() {
  const { isAuthenticated, role } = useApp();

  let ActiveNavigator = AuthNavigator;
  let flowKey = ROOT_ROUTES.AUTH_FLOW;

  if (isAuthenticated && role === ROLES.OWNER) {
    ActiveNavigator = OwnerNavigator;
    flowKey = ROOT_ROUTES.OWNER_FLOW;
  } else if (isAuthenticated && role === ROLES.CUSTOMER) {
    ActiveNavigator = CustomerNavigator;
    flowKey = ROOT_ROUTES.CUSTOMER_FLOW;
  }

  return (
    <NavigationContainer>
      <ActiveNavigator key={flowKey} />
    </NavigationContainer>
  );
}

export default AppNavigator;
