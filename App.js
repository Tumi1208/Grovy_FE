import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from './src/constants/colors';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';

function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar backgroundColor={COLORS.surface} barStyle="dark-content" />
        <AppNavigator />
      </AppProvider>
    </SafeAreaProvider>
  );
}

export default App;
