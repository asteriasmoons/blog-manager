// @ts-nocheck
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Button,
  Alert,
} from "react-native";
import { githubAPI } from "../../src/services/githubAPI";

export default function CreatePostScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title || !slug) {
      Alert.alert("Error", "Title and slug are required");
      return;
    }

    setSaving(true);
    try {
      const frontmatter = {
        title,
        description,
        pubDate: new Date().toISOString(),
        coverImage,
      };

      const filename = slug.endsWith(".mdx") ? slug : `${slug}.mdx`;

      await githubAPI.savePost(filename, frontmatter, content);

      Alert.alert("Success", "Post created!");

      // Clear form
      setTitle("");
      setDescription("");
      setSlug("");
      setCoverImage("");
      setContent("");
    } catch (error) {
      console.log("Save error:", error);
      Alert.alert("Error", "Could not save post");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Title *</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="My Amazing Blog Post"
      />

      <Text style={styles.label}>Slug (filename) *</Text>
      <TextInput
        style={styles.input}
        value={slug}
        onChangeText={setSlug}
        placeholder="my-amazing-post"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="A short description"
        multiline
      />

      <Text style={styles.label}>Cover Image URL</Text>
      <TextInput
        style={styles.input}
        value={coverImage}
        onChangeText={setCoverImage}
        placeholder="https://..."
        autoCapitalize="none"
      />

      <Text style={styles.label}>Content (MDX)</Text>
      <TextInput
        style={[styles.input, styles.contentInput]}
        value={content}
        onChangeText={setContent}
        placeholder="Write your post content here..."
        multiline
        textAlignVertical="top"
      />

      <Button
        title={saving ? "Saving..." : "Create Post"}
        onPress={handleSave}
        disabled={saving}
      />

      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  contentInput: {
    height: 200,
    paddingTop: 12,
  },
});
