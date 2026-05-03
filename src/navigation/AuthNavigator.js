import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AUTH_ROUTES } from '../constants/routes';
import { getAuthScreenTransitionOptions } from './transitionConfig';
import SignInScreen from '../screens/auth/SignInScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import {
  EntryScreen,
  LocationScreen,
  NumberInputScreen,
  SplashScreen,
  VerificationScreen,
  WelcomeScreen,
} from '../screens/opening/OpeningFlowScreens';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerShown: false,
  animation: 'slide_from_right',
  animationDuration: 240,
};

function AuthNavigator({ initialRouteName = AUTH_ROUTES.SPLASH }) {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={({ route }) => ({
        ...screenOptions,
        ...getAuthScreenTransitionOptions(route.name),
      })}
    >
      <Stack.Screen name={AUTH_ROUTES.SPLASH} component={SplashScreen} />
      <Stack.Screen name={AUTH_ROUTES.ONBOARDING} component={WelcomeScreen} />
      <Stack.Screen name={AUTH_ROUTES.ENTRY} component={EntryScreen} />
      <Stack.Screen
        name={AUTH_ROUTES.SIGN_IN}
        component={SignInScreen}
      />
      <Stack.Screen
        name={AUTH_ROUTES.SIGN_UP}
        component={SignUpScreen}
      />
      <Stack.Screen
        name={AUTH_ROUTES.NUMBER_INPUT}
        component={NumberInputScreen}
      />
      <Stack.Screen
        name={AUTH_ROUTES.VERIFICATION}
        component={VerificationScreen}
      />
      <Stack.Screen
        name={AUTH_ROUTES.LOCATION}
        component={LocationScreen}
      />
    </Stack.Navigator>
  );
}

export default AuthNavigator;
