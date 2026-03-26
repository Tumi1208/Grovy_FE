import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS } from '../constants/colors';
import { OWNER_ROUTES } from '../constants/routes';
import ManageProductsScreen from '../screens/owner/ManageProductsScreen';
import OwnerDashboardScreen from '../screens/owner/OwnerDashboardScreen';
import ShopOrdersScreen from '../screens/owner/ShopOrdersScreen';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: {
    backgroundColor: COLORS.surface,
  },
  headerTintColor: COLORS.primaryDark,
  headerTitleStyle: {
    color: COLORS.text,
    fontWeight: '600',
  },
  contentStyle: {
    backgroundColor: COLORS.background,
  },
};

function OwnerNavigator() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name={OWNER_ROUTES.DASHBOARD}
        component={OwnerDashboardScreen}
        options={{ title: 'Owner Dashboard' }}
      />
      <Stack.Screen
        name={OWNER_ROUTES.MANAGE_PRODUCTS}
        component={ManageProductsScreen}
        options={{ title: 'Manage Products' }}
      />
      <Stack.Screen
        name={OWNER_ROUTES.SHOP_ORDERS}
        component={ShopOrdersScreen}
        options={{ title: 'Shop Orders' }}
      />
    </Stack.Navigator>
  );
}

export default OwnerNavigator;
