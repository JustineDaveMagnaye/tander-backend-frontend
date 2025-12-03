import React from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface TextInputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string | undefined;
  touched?: boolean;
  placeholder?: string;
  keyboardType?: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
}

export default function TextInputField({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  touched,
  placeholder,
  keyboardType,
  autoCapitalize = "sentences",
  autoCorrect = true,
  maxLength,
  multiline = false,
  numberOfLines = 1,
}: TextInputFieldProps) {
  const [isFocused, setIsFocused] = React.useState(false);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: error && touched ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [error, touched]);

  const handleFocus = () => {
    setIsFocused(true);
    Animated.spring(scaleAnim, {
      toValue: 1.01,
      useNativeDriver: true,
      speed: 40,
      bounciness: 3,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 3,
    }).start();
    onBlur?.();
  };

  const getBorderColor = () => {
    if (touched && error) return "#D9534F";
    if (isFocused) return "#F5A14B";
    return "#E5E5E5";
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <Animated.View
        style={[
          styles.inputWrapper,
          {
            borderColor: getBorderColor(),
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            multiline && styles.multilineInput,
            Platform.OS === "android" && styles.androidAdjust,
          ]}
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#BDBDBD"
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardType={keyboardType as any}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? "top" : "center"}
        />
      </Animated.View>

      {touched && error && (
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.errorText}>{error}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  label: {
    fontWeight: "600",
    marginBottom: 6,
    fontSize: 14,
    color: "#333",
  },

  inputWrapper: {
    backgroundColor: "#F5F5F5",
    borderWidth: 1.4,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "android" ? 8 : 14, // 🔥 IMPORTANT
  },

  input: {
    fontSize: Platform.OS === "android" ? 15 : 16, // 🔥 iPhone = true size; Android = scaled
    color: "#333",
    padding: 0, // Remove Android default padding
  },

  androidAdjust: {
    paddingVertical: 2,
    includeFontPadding: false, // removes extra height in Android fonts
  },

  multilineInput: {
    minHeight: 90,
    paddingTop: 8,
  },

  errorText: {
    marginTop: 6,
    fontSize: 13,
    color: "#D9534F",
    fontWeight: "500",
  },
});
