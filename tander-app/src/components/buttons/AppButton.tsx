import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import colors from "../../config/colors";

interface AppButtonProps {
  title: string;
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  loading?: boolean;
}

export default function AppButton({
  title,
  onPress,
  style,
  disabled = false,
  loading = false,
}: AppButtonProps) {
  const [pressed, setPressed] = useState(false);

  const gradientColors = pressed
    ? ([colors.pressed.primary, colors.pressed.teal] as const)
    : colors.gradients.brandStrong.array;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.button, style]}
      onPress={onPress}
      disabled={disabled || loading}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
    >
      <LinearGradient colors={gradientColors} style={styles.gradient}>
        {loading ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <Text style={styles.text}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    borderRadius: 30,
    overflow: "hidden",
  },
  gradient: {
    paddingVertical: 15,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
  },
  text: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
});
