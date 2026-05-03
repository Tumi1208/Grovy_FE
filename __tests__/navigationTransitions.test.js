import {
  AUTH_ROUTES,
  CUSTOMER_ROUTES,
  OWNER_ROUTES,
} from '../src/constants/routes';
import {
  CUSTOMER_PRIMARY_ROUTES,
  getAuthScreenTransitionOptions,
  getCustomerScreenTransitionOptions,
  getOwnerScreenTransitionOptions,
} from '../src/navigation/transitionConfig';

describe('navigation transition config', () => {
  it('keeps auth transitions simple and smooth', () => {
    expect(getAuthScreenTransitionOptions(AUTH_ROUTES.SPLASH)).toMatchObject({
      animation: 'fade',
      animationDuration: 200,
      gestureEnabled: false,
    });

    expect(
      getAuthScreenTransitionOptions(AUTH_ROUTES.ONBOARDING),
    ).toMatchObject({
      animation: 'fade',
      animationDuration: 240,
      gestureEnabled: false,
    });

    expect(getAuthScreenTransitionOptions(AUTH_ROUTES.SIGN_IN)).toMatchObject({
      animation: 'slide_from_right',
      animationDuration: 240,
    });
  });

  it('keeps primary customer routes light and pushed routes directional', () => {
    expect(CUSTOMER_PRIMARY_ROUTES.has(CUSTOMER_ROUTES.HOME)).toBe(true);
    expect(CUSTOMER_PRIMARY_ROUTES.has(CUSTOMER_ROUTES.CART)).toBe(true);

    expect(
      getCustomerScreenTransitionOptions(CUSTOMER_ROUTES.HOME),
    ).toMatchObject({
      animation: 'fade',
      animationDuration: 160,
    });

    expect(
      getCustomerScreenTransitionOptions(CUSTOMER_ROUTES.PRODUCT_DETAIL),
    ).toMatchObject({
      animation: 'slide_from_right',
      animationDuration: 240,
    });

    expect(
      getCustomerScreenTransitionOptions(CUSTOMER_ROUTES.CHECKOUT),
    ).toMatchObject({
      animation: 'slide_from_bottom',
      animationDuration: 260,
    });

    expect(
      getCustomerScreenTransitionOptions(CUSTOMER_ROUTES.ORDER_SUCCESS),
    ).toMatchObject({
      animation: 'none',
      gestureEnabled: false,
    });
  });

  it('keeps owner root transitions calm and detail screens pushed', () => {
    expect(
      getOwnerScreenTransitionOptions(OWNER_ROUTES.DASHBOARD),
    ).toMatchObject({
      animation: 'fade',
      animationDuration: 200,
    });

    expect(
      getOwnerScreenTransitionOptions(OWNER_ROUTES.MANAGE_PRODUCTS),
    ).toMatchObject({
      animation: 'slide_from_right',
      animationDuration: 240,
    });
  });
});
