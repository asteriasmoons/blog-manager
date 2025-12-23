import { useEffect, useState } from "react";
import { Alert, View, Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, Stack } from "expo-router";

import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedInput } from "@/components/ui/ThemedInput";
import { PrimaryButton } from "@/components/ui/Buttons";
import { lystaria } from "@/src/theme/lystariaTheme";

import { CONFIG } from "@/src/config";

export default function LoginScreen() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // If token already exists, skip login
  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("github_token");
      if (token) router.replace("/(tabs)");
    })();
  }, []);

  const forceLogout = async () => {
    await AsyncStorage.removeItem("github_token");
    Alert.alert("Logged out", "Token cleared. Now login again.");
  };

  const handleLogin = async () => {
    const input = password.trim();
    if (!input) {
      Alert.alert("Error", "Please enter your password");
      return;
    }

    setLoading(true);
    try {
      if (input !== CONFIG.APP_PASSWORD) {
        Alert.alert("Error", "Incorrect password");
        return;
      }

      if (!CONFIG.GITHUB_TOKEN) {
        Alert.alert(
          "Missing Token",
          "CONFIG.GITHUB_TOKEN is missing. Add your token to config."
        );
        return;
      }

      await AsyncStorage.setItem("github_token", CONFIG.GITHUB_TOKEN.trim());

      Alert.alert("Success", "Unlocked!");
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Could not log in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Login",
          headerStyle: { backgroundColor: lystaria.colors.bg },
          headerTintColor: lystaria.colors.text,
          headerTitleStyle: { color: lystaria.colors.text },
        }}
      />

      <Screen>
        <View style={{ flex: 1, justifyContent: "center", gap: 12 }}>
          <ThemedText variant="h1" style={{ textAlign: "center" }}>
            Blog Manager
          </ThemedText>

          <ThemedText
            variant="muted"
            style={{ textAlign: "center", marginBottom: 6 }}
          >
            Enter your app password to unlock.
          </ThemedText>

          <Card strong>
            <ThemedText variant="label">Password</ThemedText>
            <ThemedInput
              placeholder="Enter password"
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={false}
            />
          </Card>

          <Pressable
            onPress={forceLogout}
            style={{
              padding: 12,
              alignItems: "center",
              borderRadius: 8,
              borderWidth: 1,
              borderColor: lystaria.colors.accent,
            }}
          >
            <ThemedText style={{ color: lystaria.colors.accent }}>
              Clear Token (Force Logout)
            </ThemedText>
          </Pressable>

          <PrimaryButton
            title={loading ? "Unlocking..." : "Unlock"}
            onPress={handleLogin}
            disabled={loading}
            icon="lock-open"
          />
        </View>
      </Screen>
    </>
  );
}
