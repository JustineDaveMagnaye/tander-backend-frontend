import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenProps = {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  backgroundColor?: string; // allow override
};

export default function Screen({
  children,
  style,
  backgroundColor = "#fff", // default app screens are light
}: ScreenProps) {
  const isLightBackground = isColorLight(backgroundColor);

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[styles.screen, { backgroundColor }, style]}
    >
      {/* AUTO-STATUS BAR COLOR */}
      <StatusBar style={isLightBackground ? "dark" : "light"} />

      <View style={[styles.view]}>{children}</View>
    </SafeAreaView>
  );
}

// Utility function: determine if a color is light or dark
function isColorLight(color: string): boolean {
  // Simple check for hex colors: #RRGGBB
  if (color.startsWith("#") && color.length === 7) {
    const r = parseInt(color.substr(1, 2), 16);
    const g = parseInt(color.substr(3, 2), 16);
    const b = parseInt(color.substr(5, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 160; // threshold for light/dark
  }
  return true;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  view: {
    flex: 1,
  },
});
