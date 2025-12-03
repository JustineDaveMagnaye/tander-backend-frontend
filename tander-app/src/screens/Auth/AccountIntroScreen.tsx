import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import GradientButton from "@/src/components/buttons/GradientButton";
import AppTextInput from "@/src/components/common/AppTextInput";
import AppText from "@/src/components/inputs/AppText";
import FullScreen from "@/src/components/layout/FullScreen";
import colors from "@/src/config/colors";
import NavigationService from "@/src/navigation/NavigationService";

export default function AccountIntroScreen() {
  const [useBiometric, setUseBiometric] = useState(true);

  // entrance animation for card + icon
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim, translateY, pulseAnim]);

  return (
    <FullScreen statusBarStyle="dark">
      <LinearGradient
        colors={colors.gradients.softAqua.array}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
        <View style={styles.header}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <View style={styles.avatarCircle}>
              <Image
                source={require("../../assets/icons/tander-logo.png")}
                style={styles.avatar}
                resizeMode="contain"
              />
            </View>
          </Animated.View>

          <AppText weight="semibold" style={styles.title}>
            Create Account
          </AppText>
          <AppText style={styles.subtitle}>
            Set up your profile to start connecting with the community.
          </AppText>
        </View>

        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Ionicons name="person-add" size={22} color={colors.accentBlue} />
            </View>
            <View>
              <Text style={styles.cardTitle}>Sign up to get started</Text>
              <Text style={styles.cardSubtitle}>
                We keep your information private and secure.
              </Text>
            </View>
          </View>

          <AppTextInput icon="mail-outline" placeholder="Email or Username" />
          <AppTextInput
            icon="lock-closed-outline"
            placeholder="Create a password"
            secureTextEntry
          />
          <AppTextInput
            icon="shield-checkmark-outline"
            placeholder="Confirm password"
            secureTextEntry
          />

          <View style={styles.biometricRow}>
            <View>
              <Text style={styles.biometricTitle}>Enable Biometric</Text>
              <Text style={styles.biometricSubtitle}>
                Use fingerprint or face ID for faster login.
              </Text>
            </View>
            <Switch
              value={useBiometric}
              onValueChange={setUseBiometric}
              trackColor={{ false: colors.borderMedium, true: colors.primary }}
              thumbColor={useBiometric ? colors.white : colors.backgroundLight}
            />
          </View>

          <GradientButton
            title="Create Account"
            // onPress={() => NavigationService.navigate("Step1BasicInfo")}
            // onPress={() =>
            //   NavigationService.replace("Register", {
            //     screen: "Step1BasicInfo",
            //   })
            // }
            onPress={() =>
              NavigationService.navigate("Auth", { screen: "Register" })
            }
            style={{ marginTop: 6 }}
          />

          <TouchableOpacity
            onPress={() =>
              NavigationService.replace("Auth", { screen: "LoginScreen" })
            }
            style={styles.footerLink}
          >
            <Text style={styles.footerText}>
              Already have an account?
              <Text style={styles.footerAction}> Sign In</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </FullScreen>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 12 : 16,
    paddingBottom: Platform.OS === "ios" ? 22 : 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 18,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.backgroundLight,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.shadowMedium,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  avatar: {
    width: 44,
    height: 44,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    color: colors.textPrimary,
    marginTop: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 6,
  },
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 18,
    shadowColor: colors.shadowMedium,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    columnGap: 12,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.accentMint,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  biometricRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: colors.backgroundLight,
    marginTop: 4,
    marginBottom: 12,
  },
  biometricTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  biometricSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 3,
  },
  footerLink: {
    marginTop: 14,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  footerAction: {
    color: colors.accentTeal,
    fontWeight: "700",
  },
});
