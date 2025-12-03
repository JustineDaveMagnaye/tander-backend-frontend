import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";
import colors from "../../config/colors";

interface LightButtonProps {
  title: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export default function LightButton({
  title,
  onPress,
  style,
}: LightButtonProps) {
  const [pressed, setPressed] = useState(false);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: pressed
            ? colors.pressed.light
            : colors.backgroundLight,
        },
        style,
      ]}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: "500",
  },
});
