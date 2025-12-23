import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { lystaria } from "../../src/theme/lystariaTheme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: lystaria.colors.accent,
        tabBarInactiveTintColor: lystaria.colors.textMuted,
        tabBarStyle: {
          backgroundColor: lystaria.colors.bg,
          borderTopColor: lystaria.colors.border,
        },
        headerStyle: { backgroundColor: lystaria.colors.bg },
        headerTitleStyle: { color: lystaria.colors.text },
        headerTintColor: lystaria.colors.text,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Posts",
          headerTitle: "My Blog Posts",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Create",
          headerTitle: "New Post",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
