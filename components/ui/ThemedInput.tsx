import { TextInput, StyleSheet } from "react-native";
import { lystaria } from "/Users/nyxiridessa/blog-manager/src/theme/lystariaTheme";
import { fonts } from "/Users/nyxiridessa/blog-manager/src/theme/fonts";

export function ThemedInput(props: any) {
  return (
    <TextInput
      placeholderTextColor={lystaria.colors.textMuted}
      {...props}
      style={[
        styles.input,
        props.multiline ? styles.multiline : null,
        props.style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: lystaria.colors.glassBorder,
    backgroundColor: "rgba(10,10,15,0.55)",
    borderRadius: lystaria.radius.input,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 16,
    color: lystaria.colors.text,
  },
  multiline: {
    minHeight: 220,
    textAlignVertical: "top",
  },
});
