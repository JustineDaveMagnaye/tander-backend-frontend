import GradientButton from "@/src/components/buttons/GradientButton";
import SocialButton from "@/src/components/buttons/SocialButton";
import AuthFooterLink from "@/src/components/common/AuthFooterLink";
import CheckboxWithLabel from "@/src/components/common/CheckboxWithLabel";
import FullScreen from "@/src/components/layout/FullScreen";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
import { useToast } from "@/src/context/ToastContext";
import { useAuth } from "@/src/hooks/useAuth";
import { useGoogleLogin } from "@/src/hooks/useGoogleLogin";

export default function LoginScreen() {
  const [agree, setAgree] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 🎉 Import Google login handler
  const { login: googleLogin } = useGoogleLogin();

  // 🎉 Import auth handler
  const { login } = useAuth();

  // 🎉 Import toast handler
  const toast = useToast();

  // ⭐ GOOGLE LOGIN HANDLER
  const handleGoogleLogin = async () => {
    try {
      const user = await googleLogin();
      if (!user) {
        toast.error("Google login failed. Please try again.");
        return;
      }

      console.log("GOOGLE USER:", user);
      toast.success("Successfully signed in with Google!");
      NavigationService.replace("LoginSuccessScreen");
    } catch (err) {
      console.log("Google Login Error:", err);
      toast.error("Google login failed. Please try again.");
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

                  await login(values);
                  toast.success("Login successful! Welcome back.");
                  NavigationService.replace("LoginSuccessScreen");
                } catch (error: any) {
                  console.error("Login error:", error);

                  // ✅ Redirect to Step 1 if profile is incomplete
                  if (error.profileIncomplete) {
                    toast.warning("Profile incomplete. Redirecting to complete your profile...");
                    setTimeout(() => {
                      NavigationService.navigate("Auth", { screen: "Register" });
                    }, 1500);
                  }
                  // ✅ Redirect to Step 2 if ID verification is incomplete
                  else if (error.idVerificationIncomplete) {
                    toast.warning("ID verification required. Redirecting to verify your identity...");
                    setTimeout(() => {
                      NavigationService.navigate("Registration", {
                        screen: "Step2IdVerification",
                        params: { username: error.username },
                      });
                    }, 1500);
                  }
                  // ❌ Invalid credentials
                  else if (error.code === 'INVALID_CREDENTIALS') {
                    toast.error("Incorrect username or password. Please try again.");
                  }
                  // ❌ Other errors
                  else {
                    toast.error(error.message || "An error occurred. Please try again.");
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
                    onPress={() => toast.info("Apple login coming soon!")}
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
                        NavigationService.navigate("Onboarding", {
                        screen: "AccountIntroScreen",
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
