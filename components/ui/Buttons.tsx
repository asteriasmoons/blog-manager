import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { lystaria } from "/Users/nyxiridessa/blog-manager/src/theme/lystariaTheme";
import { ThemedText } from "./ThemedText";

function BaseButton({
  title,
  onPress,
  disabled,
  variant,
  icon,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant: "primary" | "danger" | "ghost";
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        disabled ? styles.disabled : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <View style={styles.row}>
        {icon ? (
          <Ionicons
            name={icon}
            size={18}
            color={variant === "ghost" ? lystaria.colors.accent : "#0a0a0f"}
            style={{ marginRight: 8 }}
          />
        ) : null}
        <ThemedText
          variant="body"
          style={[
            styles.text,
            variant === "ghost" ? styles.textGhost : styles.textSolid,
          ]}
        >
          {title}
        </ThemedText>
      </View>
    </Pressable>
  );
}

export function PrimaryButton(props: any) {
  return <BaseButton variant="primary" {...props} />;
}

export function DangerButton(props: any) {
  return <BaseButton variant="danger" {...props} />;
}

export function GhostButton(props: any) {
  return <BaseButton variant="ghost" {...props} />;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  row: { flexDirection: "row", alignItems: "center" },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.5 },

  primary: {
    backgroundColor: lystaria.colors.accent,
    borderColor: "rgba(255,255,255,0.18)",
  },
  danger: {
    backgroundColor: lystaria.colors.danger,
    borderColor: "rgba(255,255,255,0.18)",
  },
  ghost: {
    backgroundColor: "transparent",
    borderColor: lystaria.colors.glassBorder,
  },

  text: { fontSize: 16 },
  textSolid: { color: "#0a0a0f" },
  textGhost: { color: lystaria.colors.accent },
});
