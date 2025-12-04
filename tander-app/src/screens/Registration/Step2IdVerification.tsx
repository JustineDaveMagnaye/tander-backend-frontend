import { Ionicons } from "@expo/vector-icons";
import { useFormikContext } from "formik";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PhotoUploadSection from "../../components/registration/PhotoUploadSection";
import ProgressBar from "../../components/ui/ProgressBar";
import RecaptchaWebView from "../../components/recaptcha/RecaptchaWebView";
import colors from "../../config/colors";
import { useSlideUp } from "../../hooks/useFadeIn";
import { Step2Nav } from "../../navigation/NavigationTypes";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";

interface Props {
  navigation: Step2Nav;
}

interface FormValues {
  idPhotos: string[];
}

export default function Step2IdVerification({ navigation }: Props) {
  const { values, setFieldValue } = useFormikContext<FormValues>();
  const { verifyId, phase1Data } = useAuth();
  const toast = useToast();

  // Initialize state if not present in Formik
  const [idPhotos, setIdPhotos] = useState<string[]>(
    values.idPhotos || [""]
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [shouldGenerateToken, setShouldGenerateToken] = useState(false);

  // Animations
  const headerAnim = useSlideUp(400, 0, 20);
  const cardAnim = useSlideUp(500, 100, 30);
  const bottomNavAnim = useSlideUp(600, 200, 40);

  // Handle photo updates
  const handleIdPhotosChange = (newIdPhotos: string[]) => {
    setIdPhotos(newIdPhotos);
    setFieldValue("idPhotos", newIdPhotos);
  };

  // Check if can proceed (only front photo required)
  const uploadedIdPhotos = idPhotos.filter((id) => id !== "").length;
  const canProceed = uploadedIdPhotos >= 1;

  // Handle reCAPTCHA token generation
  const handleRecaptchaToken = (token: string) => {
    console.log("✅ [Step2IdVerification] reCAPTCHA token received");
    setRecaptchaToken(token);
    setShouldGenerateToken(false);
    // Proceed with verification after token is received
    proceedWithVerification(token);
  };

  // Handle reCAPTCHA error
  const handleRecaptchaError = (error: string) => {
    console.error("❌ [Step2IdVerification] reCAPTCHA error:", error);
    setIsVerifying(false);
    setShouldGenerateToken(false);
    toast.error("Security verification failed. Please try again.");
  };

  // Actual verification logic (called after reCAPTCHA token is obtained)
  const proceedWithVerification = async (token: string) => {
    // Check if Phase 1 data exists
    if (!phase1Data) {
      toast.error("Phase 1 data not found. Please start registration from the beginning.");
      setIsVerifying(false);
      return;
    }

    try {
      console.log("🟡 [Step2IdVerification] Proceeding with verification...");
      console.log("🟡 [Step2IdVerification] ID Photo:", idPhotos[0]);

      // Get photo URI (front only)
      const idPhotoFrontUri = idPhotos[0];

      if (!idPhotoFrontUri) {
        throw new Error("Front ID photo is required");
      }

      console.log("🟡 [Step2IdVerification] Front URI:", idPhotoFrontUri);
      console.log("🟡 [Step2IdVerification] reCAPTCHA token:", token ? 'present' : 'missing');

      // Call verifyId API with front photo URI and reCAPTCHA token
      await verifyId(phase1Data.username, idPhotoFrontUri, token);

      console.log("✅ [Step2IdVerification] ID verified successfully!");

      // Save to Formik
      setFieldValue("idPhotos", idPhotos);

      // Show success toast
      toast.success("ID verified successfully!");

      // Navigate to Step 3 (Photos)
      setTimeout(() => {
        navigation.navigate("Step3");
      }, 500);

    } catch (error: any) {
      console.error("🔴 [Step2IdVerification] Verification error:", error);
      toast.error(error.message || "ID verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Validate and proceed to next step
  const validateAndProceed = async () => {
    // Validation: At least 1 ID photo (front only)
    if (uploadedIdPhotos < 1) {
      Alert.alert(
        "ID Photo Required",
        "Please upload a clear photo of the front of your ID to continue.",
        [{ text: "OK" }]
      );
      return;
    }

    // Check if Phase 1 data exists
    if (!phase1Data) {
      toast.error("Phase 1 data not found. Please start registration from the beginning.");
      return;
    }

    try {
      setIsVerifying(true);

      // Show verifying toast
      toast.showToast({
        type: 'info',
        message: 'Verifying your ID...',
        duration: 2000,
      });

      console.log("🟡 [Step2IdVerification] Starting reCAPTCHA token generation...");

      // Trigger reCAPTCHA token generation
      setShouldGenerateToken(true);

    } catch (error: any) {
      console.error("🔴 [Step2IdVerification] Verification error:", error);
      toast.error(error.message || "ID verification failed. Please try again.");
      setIsVerifying(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Bar */}
        <ProgressBar step={2} total={4} />

        {/* ANIMATED Step Indicator */}
        <Animated.View
          style={{
            opacity: headerAnim.opacity,
            transform: [{ translateY: headerAnim.translateY }],
          }}
        >
          <Text style={styles.stepText}>Step 2 of 4</Text>
          <Text style={styles.title}>ID Verification</Text>
          <Text style={styles.subtitle}>
            Upload a clear photo of the front of your valid ID to verify your age and ensure a safe community.
          </Text>
        </Animated.View>

        {/* ANIMATED Upload ID Section */}
        <Animated.View
          style={{
            opacity: cardAnim.opacity,
            transform: [{ translateY: cardAnim.translateY }],
          }}
        >
          <PhotoUploadSection
            title="Government-Issued ID (Front Only)"
            helperText="Upload the front of your ID where your birthdate is visible"
            photos={idPhotos}
            onPhotosChange={handleIdPhotosChange}
            maxPhotos={1}
            columns={1}
          />

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Your privacy is protected</Text>
              <Text style={styles.infoText}>
                Your ID is only used for verification and will be securely stored. We never share your personal information.
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Spacer for bottom navigation */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ANIMATED Bottom Navigation */}
      <Animated.View
        style={[
          styles.bottomNav,
          {
            opacity: bottomNavAnim.opacity,
            transform: [{ translateY: bottomNavAnim.translateY }],
          },
        ]}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          disabled={isVerifying}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        {/* Next Button */}
        <TouchableOpacity
          style={[styles.nextButton, (!canProceed || isVerifying) && styles.nextButtonDisabled]}
          onPress={validateAndProceed}
          activeOpacity={canProceed && !isVerifying ? 0.8 : 1}
          disabled={!canProceed || isVerifying}
        >
          {isVerifying ? (
            <>
              <ActivityIndicator size="small" color={colors.white} />
              <Text style={styles.nextText}>Verifying...</Text>
            </>
          ) : (
            <>
              <Text
                style={[styles.nextText, !canProceed && styles.nextTextDisabled]}
              >
                {canProceed ? "Continue to Photos" : "Upload ID Photo"}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={canProceed ? colors.white : "#9CA3AF"}
              />
            </>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Invisible reCAPTCHA WebView */}
      {shouldGenerateToken && (
        <RecaptchaWebView
          action="verify_id"
          onToken={handleRecaptchaToken}
          onError={handleRecaptchaError}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  stepText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    marginTop: 8,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },

  infoCard: {
    flexDirection: "row",
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.borderMedium,
    gap: 12,
  },

  infoTextContainer: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 4,
  },

  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },

  // Bottom Navigation
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,

    shadowColor: colors.shadowMedium,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
    elevation: 4,
  },

  backButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },

  nextButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 16,
    gap: 8,

    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },

  nextButtonDisabled: {
    backgroundColor: "#E5E7EB",
    shadowOpacity: 0.05,
    elevation: 0,
  },

  nextText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: "700",
  },

  nextTextDisabled: {
    color: "#9CA3AF",
  },
});
