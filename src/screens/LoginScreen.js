import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen({ navigation }) {
  const [token, setToken] = useState("");

  const handleLogin = async () => {
    if (!token.trim()) {
      Alert.alert("Error", "Please enter your GitHub token");
      return;
    }

    // Test the token by making a simple API call
    try {
      const response = await fetch("https://api.github.com/user", {
        headers: { Authorization: `token ${token}` },
      });

      if (response.ok) {
        await AsyncStorage.setItem("github_token", token);
        Alert.alert("Success", "Logged in successfully!");
        // Force a re-render of App.js to show the main screens
        navigation.replace("PostList");
      } else {
        Alert.alert("Error", "Invalid token. Please check and try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Could not verify token. Check your connection.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Blog Manager</Text>
      <Text style={styles.subtitle}>
        Enter your GitHub Personal Access Token
      </Text>

      <TextInput
        style={styles.input}
        placeholder="ghp_xxxxxxxxxxxx"
        value={token}
        onChangeText={setToken}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry
      />

      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
  },
});
