import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FloatingCartButton from '../components/cart/FloatingCartButton';
import { COLORS } from '../constants/colors';
import { CUSTOMER_ROUTES } from '../constants/routes';
import { AccountDataProvider } from '../context/AccountDataContext';
import { CartProvider } from '../context/CartContext';
import { FavouriteProvider } from '../context/FavouriteContext';
import AccountScreen from '../screens/customer/AccountScreen';
import AddCardScreen from '../screens/customer/account/AddCardScreen';
import AboutGrovyScreen from '../screens/customer/account/AboutGrovyScreen';
import AddressFormScreen from '../screens/customer/account/AddressFormScreen';
import DeliveryAddressesScreen from '../screens/customer/account/DeliveryAddressesScreen';
import HelpSupportScreen from '../screens/customer/account/HelpSupportScreen';
import NotificationsSettingsScreen from '../screens/customer/account/NotificationsSettingsScreen';
import OrderDetailScreen from '../screens/customer/account/OrderDetailScreen';
import OrdersScreen from '../screens/customer/account/OrdersScreen';
import PaymentMethodsScreen from '../screens/customer/account/PaymentMethodsScreen';
import ProfileManagementScreen from '../screens/customer/account/ProfileManagementScreen';
import CategoryProductsScreen from '../screens/customer/CategoryProductsScreen';
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

function CustomerNavigator({ navigationRef }) {
  const [activeRouteName, setActiveRouteName] = useState(CUSTOMER_ROUTES.HOME);

  const handleNavigationStateChange = useCallback(event => {
    const state = event.data?.state;
    const nextRouteName = state?.routes?.[state.index ?? 0]?.name;

    if (!nextRouteName) {
      return;
    }

    setActiveRouteName(currentRouteName =>
      currentRouteName === nextRouteName ? currentRouteName : nextRouteName,
    );
  }, []);

  const handleOpenCart = useCallback(() => {
    if (activeRouteName === CUSTOMER_ROUTES.CART) {
      return;
    }

    navigationRef?.current?.navigate(CUSTOMER_ROUTES.CART);
  }, [activeRouteName, navigationRef]);

  return (
    <FavouriteProvider>
      <CartProvider>
        <AccountDataProvider>
          <View style={styles.container}>
            <Stack.Navigator
              screenListeners={{
                state: handleNavigationStateChange,
              }}
              screenOptions={screenOptions}
            >
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
                name={CUSTOMER_ROUTES.CATEGORY_PRODUCTS}
                component={CategoryProductsScreen}
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
                name={CUSTOMER_ROUTES.PROFILE_MANAGEMENT}
                component={ProfileManagementScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name={CUSTOMER_ROUTES.ACCOUNT_ORDERS}
                component={OrdersScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name={CUSTOMER_ROUTES.ORDER_DETAIL}
                component={OrderDetailScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name={CUSTOMER_ROUTES.DELIVERY_ADDRESSES}
                component={DeliveryAddressesScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name={CUSTOMER_ROUTES.ADDRESS_FORM}
                component={AddressFormScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name={CUSTOMER_ROUTES.PAYMENT_METHODS}
                component={PaymentMethodsScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name={CUSTOMER_ROUTES.ADD_CARD}
                component={AddCardScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name={CUSTOMER_ROUTES.NOTIFICATION_SETTINGS}
                component={NotificationsSettingsScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name={CUSTOMER_ROUTES.HELP_SUPPORT}
                component={HelpSupportScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name={CUSTOMER_ROUTES.ABOUT_GROVY}
                component={AboutGrovyScreen}
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

            <FloatingCartButton
              cartRouteName={CUSTOMER_ROUTES.CART}
              currentRouteName={activeRouteName}
              onPress={handleOpenCart}
            />
          </View>
        </AccountDataProvider>
      </CartProvider>
    </FavouriteProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default CustomerNavigator;
