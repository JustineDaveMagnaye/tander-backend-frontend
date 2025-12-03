import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
export default function AppHeaderWithLogo() {
  return (
    <View style={styles.logoRow}>
      <Image
        source={require("../../assets/icons/tander-logo.png")}
        resizeMode="contain"
        style={styles.logo}
      />
      <Text style={styles.title}>Tander</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logoRow: {
    paddingTop: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  logo: {
    width: 80,
    height: 80,
  },

  title: {
    fontSize: 60,
    fontWeight: "700",
    color: "#000",
  },
});
