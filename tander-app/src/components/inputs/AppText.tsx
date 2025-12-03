import React from "react";
import { StyleSheet, Text, TextProps } from "react-native";
import defaultStyles from "../../config/styles";
import typography from "../../config/typography";

// TYPES FOR VALID KEYS
type TextSize = keyof typeof typography.sizes;
type TextWeight = keyof typeof typography.weights;

interface AppTextProps extends TextProps {
  size?: TextSize;
  weight?: TextWeight;
  color?: string;
  style?: any;
  children: React.ReactNode;
}

export default function AppText({
  children,
  size = "body",
  weight = "normal",
  color = defaultStyles.colors.textPrimary,
  style,
  ...otherProps
}: AppTextProps) {
  return (
    <Text
      style={[
        styles.text,
        {
          fontSize: typography.sizes[size],
          fontWeight: typography.weights[weight],
          lineHeight: typography.lineHeights[size],
          color,
        },
        style,
      ]}
      {...otherProps}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    ...defaultStyles.text,
  },
});
