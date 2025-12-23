import { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { CONFIG } from "../src/config";

export default function LoginScreen() {
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    if (password === CONFIG.APP_PASSWORD) {
      // Store the GitHub token from config
      await AsyncStorage.setItem("github_token", CONFIG.GITHUB_TOKEN);
      Alert.alert("Success", "Logged in!");
      router.replace("/(tabs)");
    } else {
      Alert.alert("Error", "Incorrect password");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Blog Manager</Text>
      <Text style={styles.subtitle}>Enter your password</Text>

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
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
