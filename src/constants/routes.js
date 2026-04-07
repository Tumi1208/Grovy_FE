export const ROOT_ROUTES = {
  AUTH_FLOW: 'AuthFlow',
  CUSTOMER_FLOW: 'CustomerFlow',
  OWNER_FLOW: 'OwnerFlow',
};

export const AUTH_ROUTES = {
  AUTH_LANDING: 'AuthLanding',
};

export const CUSTOMER_ROUTES = {
  HOME: 'CustomerHome',
  EXPLORE: 'CustomerExplore',
  FAVOURITE: 'CustomerFavourite',
  ACCOUNT: 'CustomerAccount',
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
