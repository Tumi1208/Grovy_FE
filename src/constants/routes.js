export const ROOT_ROUTES = {
  AUTH_FLOW: 'AuthFlow',
  CUSTOMER_FLOW: 'CustomerFlow',
  OWNER_FLOW: 'OwnerFlow',
};

export const AUTH_ROUTES = {
  SPLASH: 'AuthSplash',
  ONBOARDING: 'AuthOnboarding',
  ENTRY: 'AuthEntry',
  SIGN_IN: 'AuthSignIn',
  SIGN_UP: 'AuthSignUp',
  NUMBER_INPUT: 'AuthNumberInput',
  VERIFICATION: 'AuthVerification',
  LOCATION: 'AuthLocation',
};

export const CUSTOMER_ROUTES = {
  HOME: 'CustomerHome',
  EXPLORE: 'CustomerExplore',
  CATEGORY_PRODUCTS: 'CustomerCategoryProducts',
  FAVOURITE: 'CustomerFavourite',
  ACCOUNT: 'CustomerAccount',
  PROFILE_MANAGEMENT: 'CustomerProfileManagement',
  ACCOUNT_ORDERS: 'CustomerAccountOrders',
  ORDER_DETAIL: 'CustomerOrderDetail',
  DELIVERY_ADDRESSES: 'CustomerDeliveryAddresses',
  ADDRESS_FORM: 'CustomerAddressForm',
  PAYMENT_METHODS: 'CustomerPaymentMethods',
  ADD_CARD: 'CustomerAddCard',
  NOTIFICATION_SETTINGS: 'CustomerNotificationSettings',
  HELP_SUPPORT: 'CustomerHelpSupport',
  ABOUT_GROVY: 'CustomerAboutGrovy',
  PRODUCT_DETAIL: 'CustomerProductDetail',
  CART: 'CustomerCart',
  CHECKOUT: 'CustomerCheckout',
  ORDER_SUCCESS: 'CustomerOrderSuccess',
};

export const OWNER_ROUTES = {
  DASHBOARD: 'OwnerDashboard',
  MANAGE_PRODUCTS: 'OwnerManageProducts',
  SHOP_ORDERS: 'OwnerShopOrders',
};

const ROUTES = {
  ROOT: ROOT_ROUTES,
  AUTH: AUTH_ROUTES,
  CUSTOMER: CUSTOMER_ROUTES,
  OWNER: OWNER_ROUTES,
};

export default ROUTES;
