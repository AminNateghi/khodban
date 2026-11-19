import { Theme } from "@/constants";
import { MinusIcon, PlusIcon } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import { Text, TextInput } from "./Text";

interface InputNumberProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  editable?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

const getPrecision = (value: number) => {
  const [coefficient, exponent] = value.toString().toLowerCase().split("e");
  const decimalPlaces = coefficient.split(".")[1]?.length ?? 0;

  return Math.max(0, decimalPlaces - (exponent ? Number(exponent) : 0));
};

export default function InputNumber({
  label,
  value,
  onChange,
  step = 1,
  min,
  max,
  disabled = false,
  editable = true,
  containerStyle,
  inputStyle,
}: InputNumberProps) {
  const [draft, setDraft] = useState(String(value));
  const [isEditing, setIsEditing] = useState(false);
  const [pressed, setPressed] = useState<boolean>(false);

  useEffect(() => {
    if (!isEditing) {
      setDraft(String(value));
    }
  }, [value, isEditing]);

  const safeStep = Number.isFinite(step) && step > 0 ? step : 1;

  const precision = Math.min(
    12,
    Math.max(
      getPrecision(value),
      getPrecision(safeStep),
      getPrecision(min ?? 0),
      getPrecision(max ?? 0),
    ),
  );

  const roundValue = (number: number) => Number(number.toFixed(precision));

  const clamp = (number: number) => {
    let result = number;

    if (min !== undefined) result = Math.max(min, result);
    if (max !== undefined) result = Math.min(max, result);

    return roundValue(result);
  };

  const parseValue = (text: string): number | null => {
    if (text.trim() === "") return null;

    const parsed = Number(text);

    return Number.isFinite(parsed) ? parsed : null;
  };

  const currentValue = parseValue(draft) ?? value;

  const increment = () => {
    const nextValue = clamp(currentValue + safeStep);

    setDraft(String(nextValue));
    setIsEditing(false);
    onChange(nextValue);
  };

  const decrement = () => {
    const nextValue = clamp(currentValue - safeStep);

    setDraft(String(nextValue));
    setIsEditing(false);
    onChange(nextValue);
  };

  const handleChangeText = (text: string) => {
    setDraft(text);

    const parsed = parseValue(text);

    if (parsed !== null) {
      onChange(clamp(parsed));
    }
  };

  const handleBlur = () => {
    const parsed = parseValue(draft);
    const nextValue = parsed === null ? value : clamp(parsed);

    setDraft(String(nextValue));
    setIsEditing(false);
    onChange(nextValue);
  };

  const canDecrement = !disabled && (min === undefined || currentValue > min);

  const canIncrement = !disabled && (max === undefined || currentValue < max);

  return (
    <View style={styles.containerInput}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.container,
          disabled && styles.disabled,
          containerStyle,
          pressed && styles.selectorPressed,
        ]}
      >
        <Pressable
          onPress={decrement}
          disabled={!canDecrement}
          accessibilityRole="button"
          accessibilityLabel="Decrease value"
          style={[styles.button, !canDecrement && styles.buttonDisabled]}
        >
          <MinusIcon />
        </Pressable>

        <TextInput
          value={draft}
          onChangeText={handleChangeText}
          onBlur={handleBlur}
          editable={editable && !disabled}
          keyboardType="decimal-pad"
          selectTextOnFocus
          accessibilityLabel="Number input"
          style={[styles.input, inputStyle]}
          onFocus={() => {
            setPressed(true);
            setIsEditing(true);
          }}
          onEndEditing={() => setPressed(false)}
        />

        <Pressable
          onPress={increment}
          disabled={!canIncrement}
          accessibilityRole="button"
          accessibilityLabel="Increase value"
          style={[styles.button, !canIncrement && styles.buttonDisabled]}
        >
          <PlusIcon />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  containerInput: {
    marginBottom: 16,
    flex: 1,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: Theme.borderWidth,
    borderColor: Theme.border,
    borderRadius: 10,
    overflow: "hidden",
    height: Theme.height,
  },
  label: {
    fontSize: 14,
    fontWeight: 500,
    color: Theme.text,
    marginBottom: 8,
  },
  button: {
    height: "100%",
    width: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.surfaceAlt,
  },
  buttonDisabled: {
    opacity: 0.35,
  },

  input: {
    flex: 1,
    height: "100%",
    textAlign: "center",
    backgroundColor: Theme.surface,
    fontSize: 16,
    color: "#111827",
    paddingHorizontal: 4,
    direction: "ltr",
  },
  disabled: {
    opacity: 0.5,
  },
  selectorPressed: {
    borderColor: Theme.primary,
  },
});
