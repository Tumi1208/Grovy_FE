import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS } from '../constants/colors';
import { CUSTOMER_ROUTES } from '../constants/routes';
import { CartProvider } from '../context/CartContext';
import { FavouriteProvider } from '../context/FavouriteContext';
import AccountScreen from '../screens/customer/AccountScreen';
import CartScreen from '../screens/customer/CartScreen';
import CheckoutScreen from '../screens/customer/CheckoutScreen';
import ExploreScreen from '../screens/customer/ExploreScreen';
import FavouriteScreen from '../screens/customer/FavouriteScreen';
import HomeScreen from '../screens/customer/HomeScreen';
import OrderSuccessScreen from '../screens/customer/OrderSuccessScreen';
import ProductDetailScreen from '../screens/customer/ProductDetailScreen';

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

function CustomerNavigator() {
  return (
    <FavouriteProvider>
      <CartProvider>
        <Stack.Navigator screenOptions={screenOptions}>
          <Stack.Screen
            name={CUSTOMER_ROUTES.HOME}
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name={CUSTOMER_ROUTES.EXPLORE}
            component={ExploreScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name={CUSTOMER_ROUTES.FAVOURITE}
            component={FavouriteScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name={CUSTOMER_ROUTES.ACCOUNT}
            component={AccountScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name={CUSTOMER_ROUTES.PRODUCT_DETAIL}
            component={ProductDetailScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name={CUSTOMER_ROUTES.CART}
            component={CartScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name={CUSTOMER_ROUTES.CHECKOUT}
            component={CheckoutScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name={CUSTOMER_ROUTES.ORDER_SUCCESS}
            component={OrderSuccessScreen}
            options={{
              headerShown: false,
              headerBackVisible: false,
              gestureEnabled: false,
            }}
          />
        </Stack.Navigator>
      </CartProvider>
    </FavouriteProvider>
  );
}

export default CustomerNavigator;
