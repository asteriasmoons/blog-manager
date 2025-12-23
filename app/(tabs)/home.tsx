// @ts-nocheck
import { useEffect, useState } from "react";
import { View, Alert, ActivityIndicator, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, Stack } from "expo-router";

import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { ThemedText } from "@/components/ui/ThemedText";
import { PrimaryButton, GhostButton } from "@/components/ui/Buttons";
import { lystaria } from "@/src/theme/lystariaTheme";

import { githubAPI } from "@/src/services/githubAPI";

export default function HomeScreen() {
  const [lastSlug, setLastSlug] = useState<string | null>(null);

  const [tokenPresent, setTokenPresent] = useState(false);
  const [checking, setChecking] = useState(true);
  const [connected, setConnected] = useState<boolean | null>(null);

  const loadHomeState = async () => {
    try {
      setChecking(true);

      const slug = await AsyncStorage.getItem("last_opened_slug");
      setLastSlug(slug);

      const token = await AsyncStorage.getItem("github_token");
      setTokenPresent(!!token);

      if (!token) {
        setConnected(false);
        return;
      }

      await githubAPI.getPosts();
      setConnected(true);
    } catch (e: any) {
      setConnected(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    loadHomeState();
  }, []);

  const goPosts = () => router.push("/(tabs)");
  const goCreate = () => router.push("/(tabs)/explore");

  const continueEditing = () => {
    if (!lastSlug) return;
    router.push(`/edit/${lastSlug}`);
  };

  const logout = () => {
    Alert.alert("Log out", "Return to Login? (Token stays saved.)", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.setItem("app_locked", "1");
          router.replace("/login");
        },
      },
    ]);
  };

  const prettySlug = (s: string) => s.replace(".mdx", "").replace(/-/g, " ");

  return (
    <>
      <Stack.Screen
        options={{
          title: "Home",
          headerStyle: { backgroundColor: lystaria.colors.bg },
          headerTintColor: lystaria.colors.text,
          headerTitleStyle: { color: lystaria.colors.text },
        }}
      />

      <Screen>
        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
          <ThemedText variant="h1">Home</ThemedText>
          <ThemedText variant="muted">
            Quick actions and status — simple and calm.
          </ThemedText>

          {/* Quick Actions */}
          <Card strong>
            <ThemedText variant="label">Quick Actions</ThemedText>
            <View style={{ height: 10 }} />
            <PrimaryButton title="View Posts" onPress={goPosts} icon="list" />
            <View style={{ height: 10 }} />
            <GhostButton
              title="Create New Post"
              onPress={goCreate}
              icon="add"
            />
          </Card>

          {/* Continue Editing */}
          <Card>
            <ThemedText variant="label">Continue Editing</ThemedText>
            <View style={{ height: 10 }} />

            {lastSlug ? (
              <>
                <ThemedText variant="muted">
                  Last opened: {prettySlug(lastSlug)}
                </ThemedText>
                <View style={{ height: 10 }} />
                <PrimaryButton
                  title="Continue"
                  onPress={continueEditing}
                  icon="create"
                />
              </>
            ) : (
              <ThemedText variant="muted">
                No recent post yet. Open one from the Posts tab and it will show
                here.
              </ThemedText>
            )}
          </Card>

          {/* Connection Status */}
          <Card>
            <ThemedText variant="label">Connection Status</ThemedText>
            <View style={{ height: 10 }} />

            {checking ? (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <ActivityIndicator color={lystaria.colors.accent} />
                <ThemedText variant="muted">Checking…</ThemedText>
              </View>
            ) : (
              <>
                <ThemedText variant="muted">
                  Token: {tokenPresent ? "Saved" : "Missing"}
                </ThemedText>

                <View style={{ height: 6 }} />

                <ThemedText variant="muted">
                  GitHub: {connected === true ? "Connected" : "Not connected"}
                </ThemedText>

                <View style={{ height: 12 }} />

                <GhostButton
                  title="Recheck"
                  onPress={loadHomeState}
                  icon="refresh"
                />
              </>
            )}
          </Card>

          {/* Session (Normal logout — DOES NOT clear token) */}
          <Card>
            <ThemedText variant="label">Session</ThemedText>
            <View style={{ height: 10 }} />
            <GhostButton title="Log out" onPress={logout} icon="log-out" />
          </Card>
        </ScrollView>
      </Screen>
    </>
  );
}
