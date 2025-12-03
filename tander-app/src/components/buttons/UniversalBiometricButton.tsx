import colors from "@/src/config/colors";
import * as LocalAuthentication from "expo-local-authentication";
import React, { useEffect, useState } from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

interface Props {
  onAuthenticate: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function UniversalBiometricButton({
  onAuthenticate,
  style,
  textStyle,
}: Props) {
  const [biometric, setBiometric] = useState<"face" | "finger" | null>(null);

  useEffect(() => {
    detectBiometrics();
  }, []);

  const detectBiometrics = async () => {
    const supported =
      await LocalAuthentication.supportedAuthenticationTypesAsync();

    const hasFace = supported.includes(
      LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
    );

    const hasFinger = supported.includes(
      LocalAuthentication.AuthenticationType.FINGERPRINT
    );

    // ---- PLATFORM SMART LOGIC ----
    if (Platform.OS === "ios") {
      if (hasFace) return setBiometric("face");
      if (hasFinger) return setBiometric("finger");
    } else {
      // ANDROID LOGIC
      if (hasFinger) return setBiometric("finger");

      // If device has NO fingerprint → allow face
      // This means it's a high-security face sensor (Pixel-like)
      if (hasFace && !hasFinger) return setBiometric("face");
    }

    setBiometric(null);
  };

  if (!biometric) return null;

  const ICONS = {
    face: require("../../assets/icons/faceId.png"),
    finger: require("../../assets/icons/touchId.png"),
  };

  const LABEL = {
    face:
      Platform.OS === "ios"
        ? "Sign in with Face ID"
        : "Sign in with Face Unlock",
    finger:
      Platform.OS === "ios"
        ? "Sign in with Touch ID"
        : "Sign in with Fingerprint",
  };

  const authenticate = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: LABEL[biometric],
      fallbackLabel: "Use Passcode",
    });

    if (result.success) onAuthenticate();
  };

  return (
    <TouchableOpacity
      onPress={authenticate}
      activeOpacity={0.8}
      style={[styles.button, style]}
    >
      <Image source={ICONS[biometric]} style={styles.icon} />
      <Text style={[styles.text, textStyle]}>{LABEL[biometric]}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 40,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderMedium,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },

  icon: {
    width: 22,
    height: 22,
  },

  text: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
});
