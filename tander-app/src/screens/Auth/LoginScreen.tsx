import GradientButton from "@/src/components/buttons/GradientButton";
import SocialButton from "@/src/components/buttons/SocialButton";
import AuthFooterLink from "@/src/components/common/AuthFooterLink";
import CheckboxWithLabel from "@/src/components/common/CheckboxWithLabel";
import FullScreen from "@/src/components/layout/FullScreen";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeaderWithLogo from "../../components/common/AppHeaderWithLogo";
import AppTextInput from "../../components/common/AppTextInput";
import FormCard from "../../components/common/FormCard";
import colors from "../../config/colors";

import { loginSchema } from "@/src/validation/schemas/login";
import { Formik } from "formik";

import UniversalBiometricButton from "@/src/components/buttons/UniversalBiometricButton";
import NavigationService from "@/src/navigation/NavigationService";

// 🔥 Our new Google login hook
import { useGoogleLogin } from "@/src/hooks/useGoogleLogin";
import { useAuth } from "@/src/hooks/useAuth";

export default function LoginScreen() {
  const [agree, setAgree] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showProfileIncomplete, setShowProfileIncomplete] = useState(false);

  // 🎉 Import Google login handler
  const { login: googleLogin } = useGoogleLogin();

  // 🎉 Import auth handler
  const { login } = useAuth();

  // ⭐ GOOGLE LOGIN HANDLER
  const handleGoogleLogin = async () => {
    try {
      const user = await googleLogin();
      if (!user) {
        Alert.alert("Google Login Failed", "Please try again.");
        return;
      }

      console.log("GOOGLE USER:", user);

      NavigationService.replace("LoginSuccessScreen");
    } catch (err) {
      console.log("Google Login Error:", err);
    }
  };

  // ⭐ BIOMETRIC HANDLER
  const handleBiometricAuthSuccess = () => {
    console.log("BIOMETRIC SUCCESS");
    NavigationService.replace("LoginSuccessScreen");
  };

  return (
    <FullScreen statusBarStyle="dark">
      <LinearGradient
        colors={["#C8E6E2", "#FFE2C1"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* HEADER */}
      <SafeAreaView edges={["top"]} style={styles.headerView}>
        <AppHeaderWithLogo />
      </SafeAreaView>

      {/* FORM */}
      <View style={styles.body}>
        <FormCard
          title="Login to your account"
          subtitle="Welcome back, we missed you!"
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          <View style={styles.content}>
            <Formik
              initialValues={{ username: "", password: "" }}
              validationSchema={loginSchema}
              onSubmit={async (values, { setSubmitting }) => {
                try {
                  setIsLoading(true);
                  setErrorMessage(null);
                  setShowProfileIncomplete(false);

                  await login(values);
                  NavigationService.replace("LoginSuccessScreen");
                } catch (error: any) {
                  console.error("Login error:", error);

                  // Check if error is due to incomplete profile
                  if (error.profileIncomplete) {
                    setShowProfileIncomplete(true);
                    setErrorMessage("Your profile is incomplete. Please complete your registration to continue.");
                  } else if (error.code === 'INVALID_CREDENTIALS') {
                    setErrorMessage("Incorrect username or password. Please try again.");
                  } else {
                    setErrorMessage(error.message || "An error occurred. Please try again.");
                  }
                } finally {
                  setIsLoading(false);
                  setSubmitting(false);
                }
              }}
            >
              {({
                handleChange,
                handleSubmit,
                handleBlur,
                values,
                errors,
                touched,
              }) => (
                <>
                  {/* Username */}
                  <AppTextInput
                    icon="person-outline"
                    placeholder="Email or Username"
                    autoCapitalize="none"
                    value={values.username}
                    onChangeText={handleChange("username")}
                    onBlur={handleBlur("username")}
                    error={touched.username ? errors.username : null}
                  />

                  {/* Password */}
                  <AppTextInput
                    icon="lock-closed-outline"
                    placeholder="Password"
                    secureTextEntry
                    value={values.password}
                    onChangeText={handleChange("password")}
                    onBlur={handleBlur("password")}
                    error={touched.password ? errors.password : null}
                  />

                  {/* Forgot Password */}
                  <TouchableOpacity onPress={() => console.log("Forgot")}>
                    <Text style={styles.forgotText}>Forgot Password?</Text>
                  </TouchableOpacity>

                  {/* Error Message */}
                  {errorMessage && (
                    <View style={styles.errorContainer}>
                      <Text style={styles.errorText}>{errorMessage}</Text>
                      {showProfileIncomplete && (
                        <TouchableOpacity
                          style={styles.completeProfileButton}
                          onPress={() => NavigationService.navigate("Auth", { screen: "Register" })}
                        >
                          <Text style={styles.completeProfileText}>Complete Profile →</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                  {/* LOGIN */}
                  <GradientButton
                    title={isLoading ? "Logging in..." : "Login"}
                    onPress={handleSubmit}
                    disabled={!values.username || !values.password || isLoading}
                    style={{ marginTop: 5 }}
                  />

                  {/* ⭐ UNIVERSAL BIOMETRIC BUTTON */}
                  <View style={styles.biometricRow}>
                    <UniversalBiometricButton
                      onAuthenticate={handleBiometricAuthSuccess}
                    />
                  </View>

                  <Text style={styles.dividerText}>continue with</Text>

                  {/* 🍎 APPLE LOGIN (Later we implement this) */}
                  <SocialButton
                    title="Continue with Apple"
                    icon={require("../../assets/icons/apple.png")}
                    onPress={() => Alert.alert("Apple login not yet enabled")}
                    style={{ marginTop: 10 }}
                  />

                  {/* 🔥 GOOGLE LOGIN */}
                  <SocialButton
                    title="Continue with Google"
                    icon={require("../../assets/icons/google.png")}
                    light
                    onPress={handleGoogleLogin}
                    style={{ marginTop: 10 }}
                  />

                  {/* SIGNUP LINK */}
                  <View style={{ marginTop: 10, marginBottom: 10 }}>
                    <AuthFooterLink
                      label="Don't have an account?"
                      actionText="Sign Up"
                      onPress={() =>
                        NavigationService.navigate("Auth", {
                          screen: "Register",
                        })
                      }
                    />
                  </View>

                  {/* TERMS CHECKBOX */}
                  <CheckboxWithLabel
                    checked={agree}
                    label="I agree to the Terms and Condition and Privacy Policy"
                    onToggle={() => setAgree(!agree)}
                  />
                </>
              )}
            </Formik>
          </View>
        </FormCard>
      </View>
    </FullScreen>
  );
}

const styles = StyleSheet.create({
  headerView: {
    justifyContent: "center",
    alignItems: "center",
  },
  body: {
    flex: 1,
    justifyContent: "flex-end",
  },
  content: {
    marginHorizontal: 24,
  },
  forgotText: {
    textAlign: "right",
    marginTop: -25,
    marginBottom: 5,
    color: colors.accentTeal,
    fontSize: 14,
    fontWeight: "500",
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#991B1B",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  completeProfileButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#DBEAFE",
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  completeProfileText: {
    color: "#1E40AF",
    fontSize: 14,
    fontWeight: "600",
  },
  biometricRow: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 12,
  },
  dividerText: {
    textAlign: "center",
    color: colors.textMuted,
    marginTop: 10,
  },
});
