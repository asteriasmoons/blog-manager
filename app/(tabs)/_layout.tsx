import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RootLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = await AsyncStorage.getItem("github_token");
    setIsLoggedIn(!!token);
  };

  useEffect(() => {
    if (isLoggedIn === null) return; // Still loading

    const inAuthGroup = segments[0] === "(tabs)";

    if (!isLoggedIn && inAuthGroup) {
      router.replace("/login");
    } else if (isLoggedIn && !inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isLoggedIn, segments, router]); // Added router here

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="edit/[slug]" options={{ title: "Edit Post" }} />
    </Stack>
  );
}
