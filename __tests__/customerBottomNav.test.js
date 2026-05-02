import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import CustomerBottomNav from '../src/components/CustomerBottomNav';
import { CUSTOMER_ROUTES } from '../src/constants/routes';

function findTab(root, routeName) {
  return root.findByProps({
    testID: `bottom-nav-tab-${routeName}`,
  });
}

function findTextNodes(root, text) {
  return root.findAll(
    node => node.type === 'Text' && node.props?.children === text,
  );
}

describe('CustomerBottomNav', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  function renderNav({
    activeRoute = CUSTOMER_ROUTES.HOME,
    onNavigate = jest.fn(),
    totalItems = 0,
  } = {}) {
    let renderer;

    act(() => {
      renderer = TestRenderer.create(
        <CustomerBottomNav
          activeRoute={activeRoute}
          onNavigate={onNavigate}
          totalItems={totalItems}
        />,
      );
      jest.runOnlyPendingTimers();
    });

    return renderer;
  }

  it('uses the existing tab routes and ignores presses on the active tab', () => {
    const onNavigate = jest.fn();
    const renderer = renderNav({
      activeRoute: CUSTOMER_ROUTES.HOME,
      onNavigate,
      totalItems: 3,
    });

    act(() => {
      findTab(renderer.root, CUSTOMER_ROUTES.EXPLORE).props.onPress();
    });

    expect(onNavigate).toHaveBeenCalledWith(CUSTOMER_ROUTES.EXPLORE);

    act(() => {
      findTab(renderer.root, CUSTOMER_ROUTES.HOME).props.onPress();
    });

    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it('keeps the cart badge mounted with the latest count across tab changes', () => {
    const renderer = renderNav({
      activeRoute: CUSTOMER_ROUTES.HOME,
      totalItems: 3,
    });

    expect(findTextNodes(renderer.root, '3')).toHaveLength(1);

    act(() => {
      renderer.update(
        <CustomerBottomNav
          activeRoute={CUSTOMER_ROUTES.CART}
          onNavigate={jest.fn()}
          totalItems={3}
        />,
      );
      jest.runOnlyPendingTimers();
    });

    expect(findTextNodes(renderer.root, '3')).toHaveLength(1);

    act(() => {
      renderer.update(
        <CustomerBottomNav
          activeRoute={CUSTOMER_ROUTES.FAVOURITE}
          onNavigate={jest.fn()}
          totalItems={5}
        />,
      );
      jest.runOnlyPendingTimers();
    });

    expect(findTextNodes(renderer.root, '5')).toHaveLength(1);
  });
});
