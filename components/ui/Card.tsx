import { View, StyleSheet } from "react-native";
import { lystaria } from "/Users/nyxiridessa/blog-manager/src/theme/lystariaTheme";

export function Card({
  children,
  strong,
  style,
}: {
  children: React.ReactNode;
  strong?: boolean;
  style?: any;
}) {
  return (
    <View style={[styles.card, strong ? styles.strong : null, style]}>
      {/* “glass highlight” layer */}
      <View pointerEvents="none" style={styles.highlight} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: lystaria.colors.glassBg,
    borderColor: lystaria.colors.glassBorder,
    borderWidth: 1,
    borderRadius: lystaria.radius.card,
    padding: lystaria.spacing.card,
    overflow: "hidden",
    ...lystaria.shadow.soft,
  },
  strong: {
    backgroundColor: lystaria.colors.glassBgStrong,
  },
  highlight: {
    position: "absolute",
    top: -40,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    transform: [{ rotate: "20deg" }],
  },
});
