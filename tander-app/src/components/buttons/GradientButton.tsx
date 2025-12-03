import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import colors from "../../config/colors";

interface Props {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export default function GradientButton({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
}: Props) {
  const isDisabled = disabled;

  return (
    <TouchableOpacity
      activeOpacity={isDisabled ? 1 : 0.85}
      onPress={!isDisabled ? onPress : undefined}
      disabled={isDisabled}
      style={[style]}
    >
      {isDisabled ? (
        // ⭐ Modern disabled button (NO gradient)
        <View style={[styles.button, styles.disabledButton]}>
          <Text style={[styles.text, styles.disabledText]}>{title}</Text>
        </View>
      ) : (
        // ⭐ Normal gradient button
        <LinearGradient
          colors={colors.gradients.brandStrong.array}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          <Text style={[styles.text, textStyle]}>{title}</Text>
        </LinearGradient>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },

  // ⭐ Modern disabled style (NO gradient)
  disabledButton: {
    backgroundColor: "#E5E7EB", // Light neutral gray
    shadowOpacity: 0.05, // Much softer shadow
    elevation: 0,
  },

  text: {
    color: colors.white,
    fontSize: 17,
    fontWeight: "600",
  },

  // ⭐ Soft muted text
  disabledText: {
    color: "#9CA3AF", // Modern muted gray
  },
});
