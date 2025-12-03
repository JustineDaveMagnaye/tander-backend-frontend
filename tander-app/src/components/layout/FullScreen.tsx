import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FullScreenProps = {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  statusBarStyle?: "light" | "dark";
};

export default function FullScreen({
  children,
  style,
  statusBarStyle = "light", // default for hero screens
}: FullScreenProps) {
  return (
    <SafeAreaView edges={["left", "right"]} style={[styles.screen, style]}>
      <StatusBar style={statusBarStyle} />

      <View style={styles.view}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "transparent", // ⭐ very important
  },
  view: {
    flex: 1,
    backgroundColor: "transparent", // ⭐ very important
  },
});
