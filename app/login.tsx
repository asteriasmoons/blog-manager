import { useState } from "react";
import { Alert, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, Stack } from "expo-router";

import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedInput } from "@/components/ui/ThemedInput";
import { PrimaryButton } from "@/components/ui/Buttons";
import { lystaria } from "@/src/theme/lystariaTheme";

export default function LoginScreen() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!token.trim()) {
      Alert.alert("Error", "Please enter your GitHub token");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://api.github.com/user", {
        headers: { Authorization: `token ${token.trim()}` },
      });

      if (!response.ok) {
        Alert.alert("Error", "Invalid token. Please check and try again.");
        return;
      }

      await AsyncStorage.setItem("github_token", token.trim());
      Alert.alert("Success", "Logged in successfully!");

      // With expo-router, route to your tabs (Posts tab will show)
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Error", "Could not verify token. Check your connection.");
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
            Enter your GitHub Personal Access Token
          </ThemedText>

          <Card strong>
            <ThemedText variant="label">GitHub Token</ThemedText>
            <ThemedInput
              placeholder="ghp_xxxxxxxxxxxx"
              value={token}
              onChangeText={setToken}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />
          </Card>

          <PrimaryButton
            title={loading ? "Logging in..." : "Login"}
            onPress={handleLogin}
            disabled={loading}
            icon="log-in"
          />
        </View>
      </Screen>
    </>
  );
}
