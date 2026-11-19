import { StyleSheet, type TextInputProps, View } from "react-native";
import { Text, TextInput } from "@/components/Text";
import { Theme } from "@/constants";
import { useState, type ReactNode } from "react";

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  help?: string;
  startElement?: ReactNode;
  endElement?: ReactNode;
}

export function Input({
  label,
  error,
  help,
  startElement,
  endElement,
  style,
  ...props
}: InputProps) {
  const [pressed, setPressed] = useState<boolean>(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.selector,
          pressed && styles.selectorPressed,
          error && styles.borderError,
        ]}
      >
        <View style={styles.element}>{startElement}</View>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Theme.textMuted}
          {...props}
          onFocus={() => setPressed(true)}
          onEndEditing={() => setPressed(false)}
        />
        <View style={styles.element}>{endElement}</View>
      </View>
      {help && <Text style={styles.help}>{help}</Text>}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: 500,
    color: Theme.text,
    marginBottom: 8,
  },
  selector: {
    flexDirection: "row",
    borderWidth: Theme.borderWidth,
    borderColor: Theme.border,
    borderRadius: Theme.borderRadius,
    alignItems: "center",
    backgroundColor: Theme.surface,
  },
  selectorPressed: {
    borderColor: Theme.primary,
  },
  element: {
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    fontSize: Theme.fontSize,
    flexDirection: "row",
    alignItems: "center",
    color: Theme.text,
    backgroundColor: Theme.surface,
  },
  borderError: {
    borderColor: Theme.danger,
  },
  error: {
    fontSize: 12,
    color: Theme.danger,
    marginTop: 4,
  },
  help: {
    fontSize: 13,
    color: Theme.textSecondary,
    marginLeft: 5,
    marginRight: 5,
  },
});
