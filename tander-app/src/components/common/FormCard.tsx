// src/components/common/FormCard.tsx

import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import colors from "../../config/colors";

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  title?: string;
  subtitle?: string;
}

export default function FormCard({ children, style, title, subtitle }: Props) {
  return (
    <View style={[styles.card, style]}>
      {/* Header Text */}
      {title && <Text style={styles.title}>{title}</Text>}
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

      {/* Content */}
      <View>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 30,
    paddingVertical: 25,
    paddingHorizontal: 20,

    // shadow
    shadowColor: colors.shadowMedium,
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,

    // marginBottom: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 15,
  },
});
