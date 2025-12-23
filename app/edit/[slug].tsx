// @ts-nocheck
import { useEffect, useState, useCallback } from "react";
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
  const [originalPubDate, setOriginalPubDate] = useState(""); 

  const loadPost = useCallback(async () => {
    try {
      const rawContent = await githubAPI.getPost(slug as string);
      const { frontmatter, content: bodyContent } = parseMDX(rawContent);

      setTitle(frontmatter.title || "");
      setDescription(frontmatter.description || "");
	  setOriginalPubDate(frontmatter.pubDate || "");
      setCoverImage(frontmatter.coverImage || "");
      setContent(bodyContent);

	  const meta = await githubAPI.getPostMeta(slug as string);
    setSha(meta.sha);
    } catch (error) {
      Alert.alert("Error", "Could not load post");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Title is required");
      return;
    }

    setSaving(true);
    try {
      const frontmatter = {
        title,
        description,
        coverImage,
        pubDate: originalPubDate,
      };
      await githubAPI.savePost(slug as string, frontmatter, content, sha);

      Alert.alert("Success", "Post updated!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Could not save post");
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
              onPress={() => router.push("/(tabs)")}
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
              // These three lines are what make “scroll to the bottom while keyboard is open” work reliably on iOS
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode={
                Platform.OS === "ios" ? "interactive" : "on-drag"
              }
              automaticallyAdjustKeyboardInsets={true}
              contentContainerStyle={{
                gap: 12,
                paddingBottom: 220, // <- big bottom space so the last lines can scroll above the keyboard
              }}
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
                  textAlignVertical="top"
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
                  textAlignVertical="top"
                  // “infinite” feel: it can grow, but starts large enough to be usable
                  style={{ minHeight: 520 }}
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
