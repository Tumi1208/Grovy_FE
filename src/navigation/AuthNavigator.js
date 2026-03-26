import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS } from '../constants/colors';
import { AUTH_ROUTES } from '../constants/routes';
import AuthLandingScreen from '../screens/shared/AuthLandingScreen';

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

function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name={AUTH_ROUTES.AUTH_LANDING}
        component={AuthLandingScreen}
        options={{ title: 'Grovy' }}
      />
    </Stack.Navigator>
  );
}

export default AuthNavigator;
