import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AUTH_ROUTES } from '../constants/routes';
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
};

function AuthNavigator({ initialRouteName = AUTH_ROUTES.SPLASH }) {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={screenOptions}
    >
      <Stack.Screen
        name={AUTH_ROUTES.SPLASH}
        component={SplashScreen}
        options={{
          animation: 'fade',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name={AUTH_ROUTES.ONBOARDING}
        component={WelcomeScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name={AUTH_ROUTES.ENTRY}
        component={EntryScreen}
      />
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
