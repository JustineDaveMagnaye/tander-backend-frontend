import { Ionicons } from "@expo/vector-icons";
import { useFormikContext } from "formik";
import React, { useEffect, useState } from "react";
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
import RecaptchaWebView from "../../components/recaptcha/RecaptchaWebView";
import PhotoUploadSection from "../../components/registration/IDPhotoUploadSection";
import ProgressBar from "../../components/ui/ProgressBar";
import colors from "../../config/colors";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../hooks/useAuth";
import { useSlideUp } from "../../hooks/useFadeIn";
import { Step2Nav } from "../../navigation/NavigationTypes";

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

  const [idPhotos, setIdPhotos] = useState<string[]>(values.idPhotos || [""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [shouldGenerateToken, setShouldGenerateToken] = useState(false);
  const [recaptchaTimeout, setRecaptchaTimeout] = useState<NodeJS.Timeout | null>(null);

  const headerAnim = useSlideUp(400, 0, 20);
  const cardAnim = useSlideUp(500, 100, 30);
  const bottomNavAnim = useSlideUp(600, 200, 40);

  useEffect(() => {
    return () => {
      if (recaptchaTimeout) clearTimeout(recaptchaTimeout);
    };
  }, [recaptchaTimeout]);

  const handleIdPhotosChange = (newIdPhotos: string[]) => {
    setIdPhotos(newIdPhotos);
    setFieldValue("idPhotos", newIdPhotos);
  };

  const uploadedIdPhotos = idPhotos.filter((id) => id !== "").length;
  const canProceed = uploadedIdPhotos >= 1;

  const handleRecaptchaToken = (token: string) => {
    console.log("✅ [Step2IdVerification] reCAPTCHA token received");
    if (recaptchaTimeout) clearTimeout(recaptchaTimeout);
    setRecaptchaTimeout(null);
    setRecaptchaToken(token);
    setShouldGenerateToken(false);
    proceedWithVerification(token);
  };

  const handleRecaptchaError = (error: string) => {
    console.error("❌ [Step2IdVerification] reCAPTCHA error:", error);
    if (recaptchaTimeout) clearTimeout(recaptchaTimeout);
    setRecaptchaTimeout(null);
    setIsVerifying(false);
    setShouldGenerateToken(false);
    toast.error(`Security verification failed: ${error}. Please try again.`);
  };

  const handleRecaptchaTimeout = () => {
    console.warn("⚠️ [Step2IdVerification] reCAPTCHA token generation timed out");
    setShouldGenerateToken(false);
    setIsVerifying(false);
    setRecaptchaTimeout(null);
    Alert.alert(
      "Verification Timeout",
      "Security verification took too long. Please try again.",
      [
        { text: "Retry", onPress: () => validateAndProceed() },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const proceedWithVerification = async (token: string) => {
    if (!phase1Data) {
      toast.error("Phase 1 data not found. Please start registration from the beginning.");
      setIsVerifying(false);
      return;
    }

    try {
      const idPhotoFrontUri = idPhotos[0];
      if (!idPhotoFrontUri) throw new Error("Front ID photo is required");
      await verifyId(phase1Data.username, idPhotoFrontUri, token);
      setFieldValue("idPhotos", idPhotos);
      toast.success("ID verified successfully!");
      setTimeout(() => navigation.navigate("Step3"), 500);
    } catch (error: any) {
      let errorMessage = error.message || "ID verification failed.";
      toast.error(errorMessage);
      setIsVerifying(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const validateAndProceed = () => {
    if (uploadedIdPhotos < 1) {
      Alert.alert("ID Photo Required", "Please upload a clear photo of the front of your ID.", [{ text: "OK" }]);
      return;
    }

    if (!phase1Data) {
      toast.error("Phase 1 data not found. Please start registration from the beginning.");
      return;
    }

    setIsVerifying(true);
    toast.showToast({ type: "info", message: "Verifying your ID...", duration: 2000 });

    // ⚡ FIX: Cast timeout to NodeJS.Timeout for TS
    const timeout = setTimeout(() => handleRecaptchaTimeout(), 10000);
    setRecaptchaTimeout(timeout as unknown as NodeJS.Timeout);

    setShouldGenerateToken(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ProgressBar step={2} total={4} />

        <Animated.View style={{ opacity: headerAnim.opacity, transform: [{ translateY: headerAnim.translateY }] }}>
          <Text style={styles.stepText}>Step 2 of 4</Text>
          <Text style={styles.title}>ID Verification</Text>
          <Text style={styles.subtitle}>
            Upload a clear photo of the front of your valid ID to verify your age and ensure a safe community.
          </Text>
        </Animated.View>

        <Animated.View style={{ opacity: cardAnim.opacity, transform: [{ translateY: cardAnim.translateY }] }}>
          <PhotoUploadSection title="Government-Issued ID (Front Only)" helperText="Upload the front of your ID where your birthdate is visible" photos={idPhotos} onPhotosChange={handleIdPhotosChange} maxPhotos={1} columns={1} />

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

        <View style={{ height: 100 }} />
      </ScrollView>

      <Animated.View style={[styles.bottomNav, { opacity: bottomNavAnim.opacity, transform: [{ translateY: bottomNavAnim.translateY }] }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} disabled={isVerifying}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.nextButton, (!canProceed || isVerifying) && styles.nextButtonDisabled]} onPress={validateAndProceed} disabled={!canProceed || isVerifying}>
          {isVerifying ? (
            <>
              <ActivityIndicator size="small" color={colors.white} />
              <Text style={styles.nextText}>Verifying...</Text>
            </>
          ) : (
            <>
              <Text style={[styles.nextText, !canProceed && styles.nextTextDisabled]}>
                {canProceed ? "Continue to Photos" : "Upload ID Photo"}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={canProceed ? colors.white : "#9CA3AF"} />
            </>
          )}
        </TouchableOpacity>
      </Animated.View>

      {shouldGenerateToken && <RecaptchaWebView action="verify_id" onToken={handleRecaptchaToken} onError={handleRecaptchaError} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9F9" },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  stepText: { fontSize: 14, color: colors.textSecondary, marginBottom: 12, marginTop: 8 },
  title: { fontSize: 28, fontWeight: "700", color: colors.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: 15, color: colors.textSecondary, lineHeight: 22, marginBottom: 24 },
  infoCard: { flexDirection: "row", backgroundColor: colors.white, padding: 16, borderRadius: 16, marginTop: 16, borderWidth: 1, borderColor: colors.borderMedium, gap: 12 },
  infoTextContainer: { flex: 1 },
  infoTitle: { fontSize: 15, fontWeight: "600", color: colors.textPrimary, marginBottom: 4 },
  infoText: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  bottomNav: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.borderLight },
  backButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#F5F5F5", justifyContent: "center", alignItems: "center" },
  nextButton: { flex: 1, flexDirection: "row", backgroundColor: colors.primary, paddingVertical: 16, paddingHorizontal: 32, borderRadius: 30, justifyContent: "center", alignItems: "center", marginLeft: 16, gap: 8 },
  nextButtonDisabled: { backgroundColor: "#E5E7EB", shadowOpacity: 0.05, elevation: 0 },
  nextText: { color: colors.white, fontSize: 17, fontWeight: "700" },
  nextTextDisabled: { color: "#9CA3AF" },
});
