// @ts-nocheck
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  View,
} from "react-native";
import { Stack, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { githubAPI } from "@/src/services/githubAPI";
import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { ThemedText } from "@/components/ui/ThemedText";
import { GhostButton } from "@/components/ui/Buttons";
import { lystaria } from "@/src/theme/lystariaTheme";

type Post = {
  name: string;
  sha: string;
  path: string;
};

export default function PostsTab() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("github_token");
    Alert.alert("Logged out", "Token cleared", [
      { text: "OK", onPress: () => router.replace("/login") },
    ]);
  };

  const requireLogin = useCallback(async () => {
    const token = await AsyncStorage.getItem("github_token");
    if (!token) {
      router.replace("/login");
      return false;
    }
    return true;
  }, []);

  const loadPosts = useCallback(async () => {
    const ok = await requireLogin();
    if (!ok) return;

    console.log("🔵 Starting to load posts...");

    try {
      console.log("🔵 Calling githubAPI.getPosts()");
      const data = await githubAPI.getPosts();
      console.log("🟢 Posts loaded:", data.length, "posts");
      console.log("🟢 First post:", data[0]?.name);
      setPosts(data);
    } catch (e) {
      console.log("🔴 ERROR:", e);
      console.log("🔴 Error message:", e.message);
      Alert.alert("Error", "Could not load posts");
    } finally {
      setLoading(false);
    }
  }, [requireLogin]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadPosts();
    } finally {
      setRefreshing(false);
    }
  }, [loadPosts]);

  const openPost = async (post: Post) => {
    await AsyncStorage.setItem("last_opened_slug", post.name);
    router.push(`/edit/${post.name}`);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Posts",
          headerStyle: { backgroundColor: lystaria.colors.bg },
          headerTintColor: lystaria.colors.text,
          headerTitleStyle: { color: lystaria.colors.text },
        }}
      />

      <Screen>
        {loading ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color={lystaria.colors.accent} />
          </View>
        ) : (
          <>
            <View style={{ marginBottom: 12, gap: 8 }}>
              <ThemedText variant="h1">Posts</ThemedText>
              <ThemedText variant="muted">Tap a post to edit it.</ThemedText>
              <GhostButton title="Refresh" onPress={onRefresh} icon="refresh" />
              <GhostButton
                title="Logout & Clear Token"
                onPress={handleLogout}
                icon="log-out"
              />
            </View>

            <FlatList
              data={posts}
              keyExtractor={(item) => item.sha}
              contentContainerStyle={{
                gap: lystaria.spacing.gap,
                paddingBottom: 24,
              }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={lystaria.colors.accent}
                />
              }
              renderItem={({ item }) => (
                <Pressable onPress={() => openPost(item)}>
                  <Card>
                    <ThemedText variant="h2" numberOfLines={1}>
                      {item.name.replace(".mdx", "")}
                    </ThemedText>
                    <ThemedText variant="muted" numberOfLines={1}>
                      {item.name}
                    </ThemedText>
                  </Card>
                </Pressable>
              )}
              ListEmptyComponent={
                <Card strong>
                  <ThemedText variant="h2">No posts yet</ThemedText>
                  <ThemedText variant="muted">
                    Head to Create to make your first post.
                  </ThemedText>
                </Card>
              }
            />
          </>
        )}
      </Screen>
    </>
  );
}
