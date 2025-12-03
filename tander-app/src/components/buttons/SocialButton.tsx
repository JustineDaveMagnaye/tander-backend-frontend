// src/components/buttons/SocialButton.tsx

import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import colors from "../../config/colors";

interface Props {
  title: string;
  onPress: () => void;
  icon: any; // require("path/to/icon.png")
  light?: boolean; // true for Google-style button
  style?: ViewStyle;
}

export default function SocialButton({
  title,
  onPress,
  icon,
  light = false,
  style,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.button,
        light ? styles.lightButton : styles.darkButton,
        style,
      ]}
    >
      <Image source={icon} style={styles.icon} resizeMode="contain" />

      <Text style={[styles.text, light ? styles.lightText : styles.darkText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  // Google (light) style
  lightButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderMedium,
  },

  // Apple button style
  darkButton: {
    backgroundColor: colors.black,
  },

  icon: {
    width: 22,
    height: 22,
  },

  text: {
    fontSize: 16,
    fontWeight: "600",
  },

  lightText: {
    color: colors.textPrimary,
  },

  darkText: {
    color: colors.white,
  },
});
