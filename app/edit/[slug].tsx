// @ts-nocheck
import { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  ActivityIndicator,
  Alert,
  Pressable,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
  InputAccessoryView,
  KeyboardAvoidingView,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

import { githubAPI } from "../../src/services/githubAPI";
import { parseMDX } from "../../src/utils/mdxParser";

import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedInput } from "@/components/ui/ThemedInput";
import {
  PrimaryButton,
  DangerButton,
  GhostButton,
} from "@/components/ui/Buttons";
import { lystaria } from "../../src/theme/lystariaTheme";

export default function EditPostScreen() {
  const { slug } = useLocalSearchParams();
  const router = useRouter();

  const accessoryId = "editKeyboard";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sha, setSha] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    loadPost();
  }, []);

  const loadPost = async () => {
    try {
      const rawContent = await githubAPI.getPost(slug as string);
      const { frontmatter, content: bodyContent } = parseMDX(rawContent);

      setTitle(frontmatter.title || "");
      setDescription(frontmatter.description || "");
      setCoverImage(frontmatter.coverImage || "");
      setContent(bodyContent);

      const response = await fetch(
        `https://api.github.com/repos/${githubAPI.REPO_OWNER}/${githubAPI.REPO_NAME}/contents/src/content/posts/${slug}`,
        {
          headers: {
            Authorization: `token ${await AsyncStorage.getItem(
              "github_token"
            )}`,
          },
        }
      );

      const data = await response.json();
      setSha(data.sha);
    } catch (error) {
      Alert.alert("Error", "Could not load post");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Title is required");
      return;
    }

    setSaving(true);
    try {
      const frontmatter = { title, description, coverImage };
      await githubAPI.savePost(slug as string, frontmatter, content, sha);

      Alert.alert("Success", "Post updated!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Error", "Could not save post");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert("Delete Post", "Are you sure? This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await githubAPI.deletePost(slug as string, sha);
            Alert.alert("Deleted", "Post removed", [
              { text: "OK", onPress: () => router.back() },
            ]);
          } catch (error) {
            Alert.alert("Error", "Could not delete post");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <Screen>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={lystaria.colors.accent} />
        </View>
      </Screen>
    );
  }

  const prettyTitle =
    typeof slug === "string"
      ? slug.replace(".mdx", "").replace(/-/g, " ")
      : "Edit Post";

  return (
    <>
      <Stack.Screen
        options={{
          title: "Edit",
          headerStyle: { backgroundColor: lystaria.colors.bg },
          headerTintColor: lystaria.colors.text,
          headerTitleStyle: { color: lystaria.colors.text },
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              style={{ paddingHorizontal: 12 }}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={lystaria.colors.text}
              />
            </Pressable>
          ),
        }}
      />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Screen>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ gap: 12, paddingBottom: 32 }}
            >
              <ThemedText variant="h1">{prettyTitle}</ThemedText>
              <ThemedText variant="muted">
                Edit your frontmatter and MDX content.
              </ThemedText>

              <Card>
                <ThemedText variant="label">Title</ThemedText>
                <ThemedInput
                  inputAccessoryViewID={
                    Platform.OS === "ios" ? accessoryId : undefined
                  }
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Post title"
                  returnKeyType="done"
                />
              </Card>

              <Card>
                <ThemedText variant="label">Description</ThemedText>
                <ThemedInput
                  inputAccessoryViewID={
                    Platform.OS === "ios" ? accessoryId : undefined
                  }
                  value={description}
                  onChangeText={setDescription}
                  placeholder="A short description"
                  multiline
                  style={{ minHeight: 90 }}
                />
              </Card>

              <Card>
                <ThemedText variant="label">Cover Image URL</ThemedText>
                <ThemedInput
                  inputAccessoryViewID={
                    Platform.OS === "ios" ? accessoryId : undefined
                  }
                  value={coverImage}
                  onChangeText={setCoverImage}
                  placeholder="https://..."
                  autoCapitalize="none"
                  returnKeyType="done"
                />
              </Card>

              <Card strong>
                <ThemedText variant="label">Content (MDX)</ThemedText>
                <ThemedInput
                  inputAccessoryViewID={
                    Platform.OS === "ios" ? accessoryId : undefined
                  }
                  value={content}
                  onChangeText={setContent}
                  placeholder="Write your post content here..."
                  multiline
                  scrollEnabled
                  style={{ height: 420 }}
                  textAlignVertical="top"
                />
              </Card>

              <PrimaryButton
                title={saving ? "Saving..." : "Update Post"}
                onPress={handleSave}
                disabled={saving}
                icon="sparkles"
              />

              <GhostButton
                title="Back"
                onPress={() => router.back()}
                icon="arrow-back"
              />

              <DangerButton
                title="Delete Post"
                onPress={handleDelete}
                icon="trash"
              />
            </ScrollView>
          </Screen>

          {Platform.OS === "ios" && (
            <InputAccessoryView nativeID={accessoryId}>
              <View
                style={{
                  backgroundColor: lystaria.colors.bgSecondary,
                  borderTopWidth: 1,
                  borderTopColor: lystaria.colors.border,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  alignItems: "flex-end",
                }}
              >
                <Pressable
                  onPress={Keyboard.dismiss}
                  style={{ paddingVertical: 6, paddingHorizontal: 10 }}
                >
                  <ThemedText
                    variant="label"
                    style={{ color: lystaria.colors.accent }}
                  >
                    Done
                  </ThemedText>
                </Pressable>
              </View>
            </InputAccessoryView>
          )}
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </>
  );
}
