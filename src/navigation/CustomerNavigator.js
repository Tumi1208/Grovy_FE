import React, { useCallback, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomerBottomNav from '../components/CustomerBottomNav';
import FloatingCartButton from '../components/cart/FloatingCartButton';
import { COLORS } from '../constants/colors';
import { CUSTOMER_ROUTES } from '../constants/routes';
import { UI_LAYOUT } from '../constants/ui';
import { AccountDataProvider } from '../context/AccountDataContext';
import { CartProvider, useCart } from '../context/CartContext';
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
import CartScreen from '../screens/customer/CartScreen';
import CategoryProductsScreen from '../screens/customer/CategoryProductsScreen';
import CheckoutScreen from '../screens/customer/CheckoutScreen';
import ExploreScreen from '../screens/customer/ExploreScreen';
import FavouriteScreen from '../screens/customer/FavouriteScreen';
import HomeScreen from '../screens/customer/HomeScreen';
import OrderSuccessScreen from '../screens/customer/OrderSuccessScreen';
import ProductDetailScreen from '../screens/customer/ProductDetailScreen';

const Stack = createNativeStackNavigator();
const PRIMARY_NAV_ROUTES = new Set([
  CUSTOMER_ROUTES.HOME,
  CUSTOMER_ROUTES.EXPLORE,
  CUSTOMER_ROUTES.CART,
  CUSTOMER_ROUTES.FAVOURITE,
  CUSTOMER_ROUTES.ACCOUNT,
]);

function getCustomerScreenTransitionOptions(routeName) {
  if (PRIMARY_NAV_ROUTES.has(routeName)) {
    return {
      animation: 'fade',
      animationDuration: 200,
    };
  }

  if (routeName === CUSTOMER_ROUTES.ORDER_SUCCESS) {
    return {
      animation: 'fade_from_bottom',
      animationDuration: 220,
      gestureEnabled: false,
    };
  }

  return {
    animation: Platform.OS === 'android' ? 'slide_from_right' : 'default',
  };
}

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

function CustomerNavigationChrome({ activeRouteName, navigationRef }) {
  const insets = useSafeAreaInsets();
  const { totalItems } = useCart();

  const handleNavigatePrimaryRoute = useCallback(
    targetRoute => {
      if (!targetRoute || activeRouteName === targetRoute) {
        return;
      }

      navigationRef?.current?.navigate(targetRoute);
    },
    [activeRouteName, navigationRef],
  );

  const handleOpenCart = useCallback(() => {
    if (activeRouteName === CUSTOMER_ROUTES.CART) {
      return;
    }

    navigationRef?.current?.navigate(CUSTOMER_ROUTES.CART);
  }, [activeRouteName, navigationRef]);

  const bottomOffset =
    insets.bottom > 0 ? insets.bottom : UI_LAYOUT.bottomNavBottom;

  return (
    <>
      {PRIMARY_NAV_ROUTES.has(activeRouteName) ? (
        <View
          pointerEvents="box-none"
          style={[styles.bottomNavLayer, { bottom: bottomOffset }]}
        >
          <CustomerBottomNav
            activeRoute={activeRouteName}
            onNavigate={handleNavigatePrimaryRoute}
            totalItems={totalItems}
          />
        </View>
      ) : null}

      <FloatingCartButton
        cartRouteName={CUSTOMER_ROUTES.CART}
        currentRouteName={activeRouteName}
        onPress={handleOpenCart}
      />
    </>
  );
}

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

  return (
    <FavouriteProvider>
      <CartProvider>
        <AccountDataProvider>
          <View style={styles.container}>
            <Stack.Navigator
              screenListeners={{
                state: handleNavigationStateChange,
              }}
              screenOptions={({ route }) => ({
                ...screenOptions,
                ...getCustomerScreenTransitionOptions(route.name),
              })}
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
                }}
              />
            </Stack.Navigator>

            <CustomerNavigationChrome
              activeRouteName={activeRouteName}
              navigationRef={navigationRef}
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
  bottomNavLayer: {
    position: 'absolute',
    left: UI_LAYOUT.bottomNavSide,
    right: UI_LAYOUT.bottomNavSide,
    zIndex: 70,
  },
});

export default CustomerNavigator;
