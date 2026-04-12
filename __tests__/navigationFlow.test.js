import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import {
  AUTH_ROUTES,
} from '../src/constants/routes';
import {
  EntryScreen,
  LocationScreen,
  NumberInputScreen,
  VerificationScreen,
} from '../src/screens/opening/OpeningFlowScreens';

const mockUseApp = jest.fn();

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }) => children,
}));

jest.mock('../src/navigation/AuthNavigator', () => 'MockAuthNavigator');
jest.mock('../src/navigation/CustomerNavigator', () => 'MockCustomerNavigator');
jest.mock('../src/navigation/OwnerNavigator', () => 'MockOwnerNavigator');
jest.mock('../src/components/AppLoadingScreen', () => 'MockAppLoadingScreen');

jest.mock('../src/context/AppContext', () => ({
  useApp: () => mockUseApp(),
}));

jest.mock('../src/components/PrimaryButton', () => {
  const MockReact = require('react');

  return function MockPrimaryButton(props) {
    return MockReact.createElement('MockPrimaryButton', props, props.title);
  };
});

const {
  getAuthInitialRouteName,
  shouldShowCustomerApp,
} = require('../src/navigation/AppNavigator');

function createNavigationMock(overrides = {}) {
  return {
    canGoBack: jest.fn(() => true),
    goBack: jest.fn(),
    navigate: jest.fn(),
    replace: jest.fn(),
    ...overrides,
  };
}

function getNodeText(node) {
  if (typeof node === 'string') {
    return node;
  }

  if (!node || !node.children) {
    return '';
  }

  return node.children.map(getNodeText).join(' ');
}

function findPressableByText(root, text) {
  return root.find(
    node =>
      typeof node.props?.onPress === 'function' &&
      getNodeText(node).includes(text),
  );
}

function findButtonByTitle(root, title) {
  return root.findByProps({
    title,
  });
}

describe('navigation flow wiring', () => {
  beforeEach(() => {
    mockUseApp.mockReset();
  });

  it('keeps the correct root initial routes', () => {
    expect(
      getAuthInitialRouteName({
        hasCompletedLocationSetup: false,
        hasCompletedOnboarding: false,
        isAuthenticated: false,
      }),
    ).toBe(AUTH_ROUTES.SPLASH);

    expect(
      getAuthInitialRouteName({
        hasCompletedLocationSetup: false,
        hasCompletedOnboarding: true,
        isAuthenticated: true,
      }),
    ).toBe(AUTH_ROUTES.LOCATION);

    expect(
      getAuthInitialRouteName({
        hasCompletedLocationSetup: true,
        hasCompletedOnboarding: true,
        isAuthenticated: false,
      }),
    ).toBe(AUTH_ROUTES.ENTRY);
  });

  it('unlocks the customer app for a completed phone preview session', () => {
    expect(
      shouldShowCustomerApp({
        hasCompletedLocationSetup: true,
        isAuthenticated: false,
        isPreviewSession: true,
        role: 'user',
      }),
    ).toBe(true);

    expect(
      shouldShowCustomerApp({
        hasCompletedLocationSetup: false,
        isAuthenticated: false,
        isPreviewSession: true,
        role: 'user',
      }),
    ).toBe(false);
  });

  it('routes Entry screen actions correctly and keeps Google/Apple mocked', () => {
    mockUseApp.mockReturnValue({
      completeOnboarding: jest.fn(),
      openingFlow: {
        countryCode: '+84',
        phoneNumber: '',
      },
    });

    const navigation = createNavigationMock({
      canGoBack: jest.fn(() => false),
    });
    let renderer;

    act(() => {
      renderer = TestRenderer.create(
        <EntryScreen navigation={navigation} />,
      );
    });

    const root = renderer.root;

    act(() => {
      findButtonByTitle(root, 'Go to Sign In').props.onPress();
    });
    expect(navigation.navigate).toHaveBeenCalledWith(AUTH_ROUTES.SIGN_IN);

    act(() => {
      findButtonByTitle(root, 'Go to Sign Up').props.onPress();
    });
    expect(navigation.navigate).toHaveBeenCalledWith(AUTH_ROUTES.SIGN_UP);

    act(() => {
      findPressableByText(root, 'Continue with phone').props.onPress();
    });
    expect(navigation.navigate).toHaveBeenCalledWith(AUTH_ROUTES.NUMBER_INPUT);

    act(() => {
      findPressableByText(root, 'Continue with Google').props.onPress();
    });
    expect(
      root.findAllByType(Text).some(node =>
        getNodeText(node).includes('Google sign in is still mock-only'),
      ),
    ).toBe(true);

    act(() => {
      findPressableByText(root, 'Continue with Apple').props.onPress();
    });
    expect(
      root.findAllByType(Text).some(node =>
        getNodeText(node).includes('Apple sign in is still mock-only'),
      ),
    ).toBe(true);
  });

  it('keeps the phone flow connected from number to verification to location', () => {
    const saveOpeningPhone = jest.fn();
    const completeOpeningVerification = jest.fn();
    const completeCustomerOpeningFlow = jest.fn();
    const saveOpeningLocation = jest.fn();

    mockUseApp.mockReturnValue({
      completeCustomerOpeningFlow,
      completeOpeningVerification,
      currentUser: null,
      isAuthenticated: false,
      openingFlow: {
        countryCode: '+84',
        phoneNumber: '',
        isVerificationComplete: true,
        verificationCode: '',
        selectedLocation: null,
      },
      saveOpeningLocation,
      saveOpeningPhone,
    });

    const numberNavigation = createNavigationMock();
    let numberRenderer;

    act(() => {
      numberRenderer = TestRenderer.create(
        <NumberInputScreen
          navigation={numberNavigation}
          route={{ params: {} }}
        />,
      );
    });

    const numberRoot = numberRenderer.root;
    const numberInput = numberRoot.findByProps({
      placeholder: '912 345 678',
    });

    act(() => {
      numberInput.props.onChangeText('912345678');
    });

    act(() => {
      findButtonByTitle(numberRoot, 'Continue').props.onPress();
    });

    expect(saveOpeningPhone).toHaveBeenCalledWith({
      countryCode: '+84',
      phoneNumber: '912345678',
    });
    expect(numberNavigation.navigate).toHaveBeenCalledWith(
      AUTH_ROUTES.VERIFICATION,
      {
        countryCode: '+84',
        phoneNumber: '912345678',
      },
    );

    const verificationNavigation = createNavigationMock();
    let verificationRenderer;

    act(() => {
      verificationRenderer = TestRenderer.create(
        <VerificationScreen
          navigation={verificationNavigation}
          route={{
            params: {
              countryCode: '+84',
              phoneNumber: '912345678',
            },
          }}
        />,
      );
    });

    const verificationRoot = verificationRenderer.root;
    const codeInput = verificationRoot.findByProps({
      maxLength: 4,
    });

    act(() => {
      codeInput.props.onChangeText('1234');
    });

    act(() => {
      findButtonByTitle(verificationRoot, 'Continue to location').props.onPress();
    });

    expect(completeOpeningVerification).toHaveBeenCalledWith('1234');
    expect(verificationNavigation.navigate).toHaveBeenCalledWith(
      AUTH_ROUTES.LOCATION,
      {
        backRouteName: AUTH_ROUTES.VERIFICATION,
      },
    );

    const locationNavigation = createNavigationMock();
    let locationRenderer;

    act(() => {
      locationRenderer = TestRenderer.create(
        <LocationScreen
          navigation={locationNavigation}
          route={{
            params: {
              backRouteName: AUTH_ROUTES.VERIFICATION,
            },
          }}
        />,
      );
    });

    const locationRoot = locationRenderer.root;
    const locationInput = locationRoot.findByProps({
      placeholder: 'District 1, Ho Chi Minh City',
    });

    act(() => {
      locationInput.props.onChangeText('District 1');
    });

    act(() => {
      findButtonByTitle(locationRoot, 'Continue to shop').props.onPress();
    });

    expect(saveOpeningLocation).toHaveBeenCalledWith({
      detail: 'District 1',
      fullAddress: 'District 1',
      label: 'Manual location',
      shortLabel: 'District 1',
      source: 'manual',
    });
    expect(completeCustomerOpeningFlow).toHaveBeenCalledWith({
      detail: 'District 1',
      fullAddress: 'District 1',
      label: 'Manual location',
      shortLabel: 'District 1',
      source: 'manual',
    });
  });
});
