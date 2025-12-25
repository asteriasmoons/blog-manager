// app/(tabs)/explore.tsx
// @ts-nocheck
import { useState } from "react";
import {
  ScrollView,
  View,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
  InputAccessoryView,
  KeyboardAvoidingView,
  Pressable,
} from "react-native";
import { Stack, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedInput } from "@/components/ui/ThemedInput";
import { PrimaryButton, GhostButton } from "@/components/ui/Buttons";
import { lystaria } from "@/src/theme/lystariaTheme";

import { githubAPI } from "@/src/services/githubAPI";

export default function CreatePostScreen() {
  const accessoryId = "createKeyboard";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");

  // NEW: tags (comma-separated in UI)
  const [tags, setTags] = useState("");

  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const slugFromTitle = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .concat(".mdx");

  // NEW: parse comma-separated tags into an array
  const parseTags = (value: string) =>
    value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Title is required");
      return;
    }

    const filename = slugFromTitle(title);

    setSaving(true);
    try {
      const frontmatter = {
        title: title.trim(),
        description: description?.trim() || "",
        coverImage: coverImage?.trim() || "",
        pubDate: new Date().toISOString().split("T")[0], // Just YYYY-MM-DD

        // NEW: tags array (will become YAML in githubAPI.savePost)
        tags: parseTags(tags),
      };

      // CREATE = savePost with NO sha
      const result = await githubAPI.savePost(filename, frontmatter, content);

      // GitHub sometimes returns errors as JSON too -- catch obvious ones
      if (result?.message && !result?.content) {
        Alert.alert("Error", result.message);
        return;
      }

      if (result?.status === 422) {
        Alert.alert("Error", "A post with that name already exists.");
        return;
      }

      Alert.alert("Success", "Post created!", [
        {
          text: "View Posts",
          onPress: () => router.push("/(tabs)"),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "Could not create post");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Create",
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
              contentContainerStyle={{ gap: 12, paddingBottom: 120 }}
            >
              <ThemedText variant="h1">Create New Post</ThemedText>
              <ThemedText variant="muted">
                Start with a title -- everything else can evolve.
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
                <View style={{ height: 10 }} />
                <ThemedText variant="muted">
                  Filename: {title.trim() ? slugFromTitle(title) : "--"}
                </ThemedText>
              </Card>

              <Card>
                <ThemedText variant="label">Description</ThemedText>
                <ThemedInput
                  inputAccessoryViewID={
                    Platform.OS === "ios" ? accessoryId : undefined
                  }
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Short summary (optional)"
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

              {/* NEW: Tags */}
              <Card>
                <ThemedText variant="label">Tags</ThemedText>
                <View style={{ height: 8 }} />
                <ThemedText variant="muted">
                  Comma-separated (optional). Example: shadow work, birthdays, witchcraft
                </ThemedText>
                <View style={{ height: 10 }} />
                <ThemedInput
                  inputAccessoryViewID={
                    Platform.OS === "ios" ? accessoryId : undefined
                  }
                  value={tags}
                  onChangeText={setTags}
                  placeholder="tag one, tag two, tag three"
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
                  textAlignVertical="top"
                  style={{ minHeight: 420 }}
                />
              </Card>

              <PrimaryButton
                title={saving ? "Creating..." : "Create Post"}
                onPress={handleCreate}
                disabled={saving}
                icon="sparkles"
              />

              <GhostButton
                title="Cancel"
                onPress={() => router.back()}
                icon="close"
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