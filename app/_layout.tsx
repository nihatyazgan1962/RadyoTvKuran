import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';

import { useColorScheme } from '@/components/useColorScheme';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

try {
  SplashScreen.preventAutoHideAsync().catch(() => {});
} catch (e) {}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    try {
      SplashScreen.hideAsync().catch(() => {});
    } catch (e) {}
  }, [loaded]);

  return <RootLayoutNav />;
}

const AppDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0B0F19',
    card: '#0F172A',
    text: '#F8FAFC',
    border: '#1E293B',
    primary: '#E11D48',
  },
};

function RootLayoutNav() {
  return (
    <ThemeProvider value={AppDarkTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
