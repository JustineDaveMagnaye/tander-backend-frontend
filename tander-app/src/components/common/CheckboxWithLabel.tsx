import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import colors from "../../config/colors";

interface Props {
  checked: boolean;
  label: string;
  onToggle: () => void;
}

export default function CheckboxWithLabel({ checked, label, onToggle }: Props) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      {/* Checkbox */}
      <View style={[styles.checkbox, checked && styles.checkedBox]}>
        {checked && <Ionicons name="checkmark" size={14} color="#fff" />}
      </View>

      {/* Label */}
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 10,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#F5A14B", // your orange accent
    alignItems: "center",
    justifyContent: "center",
  },

  checkedBox: {
    backgroundColor: "#F5A14B",
  },

  label: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
  },
});
