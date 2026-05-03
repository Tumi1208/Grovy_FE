import {
  AUTH_ROUTES,
  CUSTOMER_ROUTES,
  OWNER_ROUTES,
} from '../constants/routes';

const TRANSITION_DURATIONS = Object.freeze({
  tab: 160,
  fade: 200,
  push: 240,
  modal: 260,
});

export const CUSTOMER_PRIMARY_ROUTES = new Set([
  CUSTOMER_ROUTES.HOME,
  CUSTOMER_ROUTES.EXPLORE,
  CUSTOMER_ROUTES.CART,
  CUSTOMER_ROUTES.FAVOURITE,
  CUSTOMER_ROUTES.ACCOUNT,
]);

export function getAuthScreenTransitionOptions(routeName) {
  if (routeName === AUTH_ROUTES.SPLASH) {
    return {
      animation: 'fade',
      animationDuration: TRANSITION_DURATIONS.fade,
      gestureEnabled: false,
    };
  }

  if (routeName === AUTH_ROUTES.ONBOARDING) {
    return {
      animation: 'fade',
      animationDuration: TRANSITION_DURATIONS.push,
      gestureEnabled: false,
    };
  }

  if (routeName === AUTH_ROUTES.ENTRY) {
    return {
      animation: 'fade',
      animationDuration: TRANSITION_DURATIONS.fade,
    };
  }

  return {
    animation: 'slide_from_right',
    animationDuration: TRANSITION_DURATIONS.push,
  };
}

export function getCustomerScreenTransitionOptions(routeName) {
  if (routeName === CUSTOMER_ROUTES.ORDER_SUCCESS) {
    return {
      animation: 'none',
      gestureEnabled: false,
    };
  }

  if (routeName === CUSTOMER_ROUTES.CHECKOUT) {
    return {
      animation: 'slide_from_bottom',
      animationDuration: TRANSITION_DURATIONS.modal,
    };
  }

  if (CUSTOMER_PRIMARY_ROUTES.has(routeName)) {
    return {
      animation: 'fade',
      animationDuration: TRANSITION_DURATIONS.tab,
    };
  }

  return {
    animation: 'slide_from_right',
    animationDuration: TRANSITION_DURATIONS.push,
  };
}

export function getOwnerScreenTransitionOptions(routeName) {
  if (routeName === OWNER_ROUTES.DASHBOARD) {
    return {
      animation: 'fade',
      animationDuration: TRANSITION_DURATIONS.fade,
    };
  }

  return {
    animation: 'slide_from_right',
    animationDuration: TRANSITION_DURATIONS.push,
  };
}
