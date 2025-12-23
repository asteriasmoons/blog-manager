import { View, StyleSheet } from "react-native";
import { lystaria } from "/Users/nyxiridessa/blog-manager/src/theme/lystariaTheme";

export function Screen({ children }: { children: React.ReactNode }) {
  return <View style={styles.screen}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: lystaria.colors.bg,
    padding: lystaria.spacing.page,
  },
});
