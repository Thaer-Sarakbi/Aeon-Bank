import { DefaultTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import StateView from '@/components/StateView';
import RootNavigator from '@/navigation/RootNavigator';
import { checkDeviceIntegrity } from '@/security/deviceIntegrity';
import { useScreenCaptureProtection } from '@/security/useScreenCaptureProtection';
import { colors } from '@/theme/colors';

const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.accent,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.border,
  },
};

export default function App() {
  const [integrity] = useState(checkDeviceIntegrity);
  useScreenCaptureProtection();

  return (
    <SafeAreaProvider>
      {integrity.compromised ? (
        <StateView
          variant="error"
          title="Device not supported"
          message="For your security, this app can't run on a rooted or jailbroken device."
        />
      ) : (
        <NavigationContainer theme={navigationTheme}>
          <RootNavigator />
        </NavigationContainer>
      )}
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
