// @ts-nocheck
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { githubAPI } from "../../src/services/githubAPI";

interface Post {
  name: string;
  sha: string;
  path: string;
}

export default function PostListScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      console.log("Loading posts...");
      const data = await githubAPI.getPosts();
      console.log("Posts data:", data);
      setPosts(data);
    } catch (error) {
      console.log("Error loading posts:", error);
      Alert.alert("Error", "Could not load posts");
    } finally {
      setLoading(false);
    }
  };

  const handlePostPress = (post: Post) => {
    router.push(`/edit/${post.name}`);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.sha}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.postItem}
            onPress={() => handlePostPress(item)}
          >
            <Text style={styles.postTitle}>
              {item.name.replace(".mdx", "")}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No posts yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  postItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  postTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
});
