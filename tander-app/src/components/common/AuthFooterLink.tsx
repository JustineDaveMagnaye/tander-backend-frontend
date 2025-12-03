import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import colors from "../../config/colors";

interface Props {
  label: string; // e.g. "Don't have an account?"
  actionText: string; // e.g. "Sign Up"
  onPress: () => void;
}

export default function AuthFooterLink({ label, actionText, onPress }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label} </Text>

      <TouchableOpacity onPress={onPress}>
        <Text style={styles.action}>{actionText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 10,
  },

  label: {
    color: colors.textPrimary,
    fontSize: 14,
  },

  action: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
