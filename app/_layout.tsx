import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { IDSTheme } from '@/constants/ids-theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Custom dark theme for NetShield
const NetShieldTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: IDSTheme.colors.primary,
    background: IDSTheme.colors.background,
    card: IDSTheme.colors.surface,
    text: IDSTheme.colors.text.primary,
    border: IDSTheme.colors.border,
    notification: IDSTheme.colors.error,
  },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={NetShieldTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen 
          name="alert-detail" 
          options={{ 
            presentation: 'card',
            headerShown: false,
          }} 
        />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
