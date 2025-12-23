import { Text, StyleSheet } from "react-native";
import { lystaria } from "/Users/nyxiridessa/blog-manager/src/theme/lystariaTheme";
import { fonts } from "/Users/nyxiridessa/blog-manager/src/theme/fonts";

export function ThemedText({
  children,
  variant = "body",
  style,
  numberOfLines,
}: {
  children: React.ReactNode;
  variant?: "h1" | "h2" | "label" | "body" | "muted";
  style?: any;
  numberOfLines?: number;
}) {
  return (
    <Text numberOfLines={numberOfLines} style={[styles[variant], style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  h1: {
    fontFamily: fonts.heading,
    fontSize: 26,
    color: "#ffffff",
    letterSpacing: 1,
    marginBottom: 8,
  },
  h2: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: "#ffffff",
    marginBottom: 6,
  },
  label: {
    fontFamily: fonts.heading,
    fontSize: 15,
    color: lystaria.colors.text,
    marginBottom: 6,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: lystaria.colors.text,
    lineHeight: 24,
  },
  muted: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: lystaria.colors.textMuted,
    lineHeight: 22,
  },
});
