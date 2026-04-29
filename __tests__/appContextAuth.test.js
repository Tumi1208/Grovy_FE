import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import { AppProvider, useApp } from '../src/context/AppContext';

jest.mock('../src/services/authStorage', () => ({
  clearLegacyUserData: jest.fn(),
  clearStoredAuthToken: jest.fn(),
  clearStoredAuthUser: jest.fn(),
  clearStoredOpeningLocation: jest.fn(),
  getStoredAuthToken: jest.fn(),
  getStoredAuthUser: jest.fn(),
  getStoredLocationCompleted: jest.fn(),
  getStoredOnboardingCompleted: jest.fn(),
  getStoredOpeningLocation: jest.fn(),
  migrateLegacyLocationState: jest.fn(),
  storeAuthToken: jest.fn(),
  storeAuthUser: jest.fn(),
  storeLocationCompleted: jest.fn(),
  storeOnboardingCompleted: jest.fn(),
  storeOpeningLocation: jest.fn(),
}));

jest.mock('../src/services/authService', () => ({
  getCurrentUserProfile: jest.fn(),
  signInWithEmail: jest.fn(),
  signUpWithEmail: jest.fn(),
  updateMyProfile: jest.fn(),
}));

jest.mock('../src/services/apiClient', () => ({
  setApiAuthToken: jest.fn(),
}));

const {
  clearLegacyUserData,
  clearStoredAuthToken,
  clearStoredAuthUser,
  clearStoredOpeningLocation,
  getStoredAuthToken,
  getStoredAuthUser,
  getStoredLocationCompleted,
  getStoredOnboardingCompleted,
  getStoredOpeningLocation,
  migrateLegacyLocationState,
  storeAuthToken,
  storeAuthUser,
  storeLocationCompleted,
  storeOnboardingCompleted,
  storeOpeningLocation,
} = require('../src/services/authStorage');

const {
  getCurrentUserProfile,
  signInWithEmail,
  signUpWithEmail,
  updateMyProfile,
} = require('../src/services/authService');

const { setApiAuthToken } = require('../src/services/apiClient');

let latestAppContext = null;

function AppContextProbe() {
  latestAppContext = useApp();

  return (
    <Text>
      {latestAppContext.isAuthenticated ? 'authenticated' : 'signed-out'}
    </Text>
  );
}

function createStoredUser(overrides = {}) {
  return {
    id: 'user-1',
    displayName: 'Demo Customer',
    name: 'Demo Customer',
    email: 'demo@grovy.app',
    role: 'user',
    addresses: [],
    paymentMethods: [],
    ...overrides,
  };
}

describe('AppContext auth session flow', () => {
  beforeEach(() => {
    latestAppContext = null;

    clearLegacyUserData.mockResolvedValue();
    clearStoredAuthToken.mockResolvedValue();
    clearStoredAuthUser.mockResolvedValue();
    clearStoredOpeningLocation.mockResolvedValue();
    getStoredAuthToken.mockResolvedValue('');
    getStoredAuthUser.mockResolvedValue(null);
    getStoredLocationCompleted.mockResolvedValue(true);
    getStoredOnboardingCompleted.mockResolvedValue(true);
    getStoredOpeningLocation.mockResolvedValue(null);
    migrateLegacyLocationState.mockResolvedValue();
    storeAuthToken.mockResolvedValue();
    storeAuthUser.mockResolvedValue();
    storeLocationCompleted.mockResolvedValue();
    storeOnboardingCompleted.mockResolvedValue();
    storeOpeningLocation.mockResolvedValue();

    getCurrentUserProfile.mockResolvedValue(createStoredUser());
    signInWithEmail.mockResolvedValue({
      token: 'signed-in-token',
      user: createStoredUser(),
    });
    signUpWithEmail.mockResolvedValue({
      token: 'signed-up-token',
      user: createStoredUser({ id: 'user-2', email: 'new@grovy.app' }),
    });
    updateMyProfile.mockResolvedValue({
      user: createStoredUser({ displayName: 'Updated Name' }),
    });
    setApiAuthToken.mockReset();
  });

  it('restores a persisted session from AsyncStorage on cold start', async () => {
    const storedUser = createStoredUser({ email: 'persisted@grovy.app' });

    getStoredAuthToken.mockResolvedValue('persisted-token');
    getStoredAuthUser.mockResolvedValue(storedUser);

    await act(async () => {
      TestRenderer.create(
        <AppProvider>
          <AppContextProbe />
        </AppProvider>,
      );
    });

    expect(latestAppContext.isInitializing).toBe(false);
    expect(latestAppContext.isAuthenticated).toBe(true);
    expect(latestAppContext.currentUser?.email).toBe('persisted@grovy.app');
    expect(setApiAuthToken).toHaveBeenCalledWith('persisted-token');
    expect(getCurrentUserProfile).not.toHaveBeenCalled();
  });

  it('updates auth state immediately on sign in and clears it on sign out', async () => {
    await act(async () => {
      TestRenderer.create(
        <AppProvider>
          <AppContextProbe />
        </AppProvider>,
      );
    });

    expect(latestAppContext.isAuthenticated).toBe(false);

    await act(async () => {
      await latestAppContext.signIn({
        email: 'demo@grovy.app',
        password: 'Grovy123',
      });
    });

    expect(signInWithEmail).toHaveBeenCalledWith({
      email: 'demo@grovy.app',
      password: 'Grovy123',
    });
    expect(latestAppContext.isAuthenticated).toBe(true);
    expect(latestAppContext.currentUser?.email).toBe('demo@grovy.app');
    expect(storeAuthToken).toHaveBeenCalledWith('signed-in-token');
    expect(storeAuthUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'demo@grovy.app',
      }),
    );
    expect(setApiAuthToken).toHaveBeenLastCalledWith('signed-in-token');

    await act(async () => {
      await latestAppContext.signOut();
    });

    expect(clearStoredAuthToken).toHaveBeenCalled();
    expect(clearStoredAuthUser).toHaveBeenCalled();
    expect(clearLegacyUserData).toHaveBeenCalled();
    expect(latestAppContext.isAuthenticated).toBe(false);
    expect(latestAppContext.hasCompletedLocation).toBe(false);
    expect(latestAppContext.currentUser).toBe(null);
    expect(setApiAuthToken).toHaveBeenLastCalledWith('');
  });

  it('forces a new signup session back through location setup', async () => {
    await act(async () => {
      TestRenderer.create(
        <AppProvider>
          <AppContextProbe />
        </AppProvider>,
      );
    });

    await act(async () => {
      await latestAppContext.signUp({
        displayName: 'New User',
        email: 'new@grovy.app',
        password: 'Grovy123',
      });
    });

    expect(signUpWithEmail).toHaveBeenCalledWith({
      displayName: 'New User',
      email: 'new@grovy.app',
      password: 'Grovy123',
    });
    expect(latestAppContext.isAuthenticated).toBe(true);
    expect(latestAppContext.currentUser?.email).toBe('new@grovy.app');
    expect(latestAppContext.hasCompletedLocation).toBe(false);
    expect(storeLocationCompleted).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'user-2',
        email: 'new@grovy.app',
      }),
      false,
    );
    expect(clearStoredOpeningLocation).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'user-2',
        email: 'new@grovy.app',
      }),
    );
  });
});
