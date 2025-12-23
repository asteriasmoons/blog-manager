import { useEffect } from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, SplashScreen } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

import { useFonts } from "expo-font";
import { Sail_400Regular } from "@expo-google-fonts/sail";
import { HachiMaruPop_400Regular } from "@expo-google-fonts/hachi-maru-pop";

// Keep splash visible until fonts load
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    Sail_400Regular,
    HachiMaruPop_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="edit/[slug]"
          options={{ headerShown: true, title: "Edit Post" }}
        />
        <Stack.Screen
          name="login"
          options={{ headerShown: true, title: "Login" }}
        />
      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
