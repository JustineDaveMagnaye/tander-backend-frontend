import { Ionicons } from "@expo/vector-icons";
import { useFormikContext } from "formik";
import React, { useState } from "react";
import {
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
import colors from "../../config/colors";
import { useSlideUp } from "../../hooks/useFadeIn";
import { Step3Nav } from "../../navigation/NavigationTypes";

interface Props {
  navigation: Step3Nav;
}

interface FormValues {
  photos: string[];
  profilePicture: string;
}

export default function Step3Upload({ navigation }: Props) {
  const { values, setFieldValue } = useFormikContext<FormValues>();

  // State for multiple photos and profile picture
  const [photos, setPhotos] = useState<string[]>(values.photos || Array(6).fill(""));
  const [profilePicture, setProfilePicture] = useState<string>(values.profilePicture || "");

  // Animations
  const stepTextAnim = useSlideUp(400, 0, 20);
  const photoCardAnim = useSlideUp(500, 100, 30);
  const profilePicAnim = useSlideUp(500, 200, 30);
  const bottomNavAnim = useSlideUp(600, 300, 40);

  // Validate before proceeding
  const validateAndProceed = () => {
    const uploadedPhotos = photos.filter((photo) => photo !== "").length;

    if (uploadedPhotos < 2) {
      Alert.alert(
        "Photos Required",
        "Please upload at least 2 photos to continue.",
        [{ text: "OK" }]
      );
      return;
    }

    // Save to Formik
    setFieldValue("photos", photos);
    setFieldValue("profilePicture", profilePicture);

    navigation.navigate("Step4");
  };

  const canProceed = photos.filter((p) => p !== "").length >= 2;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProgressBar step={3} total={4} />

        {/* Step Indicator */}
        <Animated.View style={{ opacity: stepTextAnim.opacity, transform: [{ translateY: stepTextAnim.translateY }] }}>
          <Text style={styles.stepText}>Step 3 of 4</Text>
        </Animated.View>

        
        {/* Upload Profile Picture (Optional) */}
        <Animated.View style={{ opacity: profilePicAnim.opacity, transform: [{ translateY: profilePicAnim.translateY }] }}>
          <PhotoUploadSection
            title="Profile Picture (Optional)"
            helperText="Add a profile picture. You can skip this step if you want."
            photos={profilePicture ? [profilePicture] : [""]}
            onPhotosChange={(newPics) => {
              setProfilePicture(newPics[0] || "");
              setFieldValue("profilePicture", newPics[0] || "");
            }}
            maxPhotos={1}
            columns={1}
          />
        </Animated.View>

        
        {/* Upload Photos */}
        <Animated.View style={{ opacity: photoCardAnim.opacity, transform: [{ translateY: photoCardAnim.translateY }] }}>
          <PhotoUploadSection
            title="Your Photos"
            helperText="Add at least 2 photos to showcase yourself (maximum 6)"
            photos={photos}
            onPhotosChange={(newPhotos) => {
              setPhotos(newPhotos);
              setFieldValue("photos", newPhotos);
            }}
            maxPhotos={6}
            columns={3}
          />
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <Animated.View style={[styles.bottomNav, { opacity: bottomNavAnim.opacity, transform: [{ translateY: bottomNavAnim.translateY }] }]}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        {/* Next Button */}
        <TouchableOpacity
          style={[styles.nextButton, !canProceed && styles.nextButtonDisabled]}
          onPress={validateAndProceed}
          activeOpacity={canProceed ? 0.8 : 1}
          disabled={!canProceed}
        >
          <Text style={[styles.nextText, !canProceed && styles.nextTextDisabled]}>
            {canProceed ? "Continue to Final Step" : "Upload Required Photos"}
          </Text>
          <Ionicons name="chevron-forward" size={20} color={canProceed ? colors.white : "#9CA3AF"} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9F9" },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  stepText: { fontSize: 14, color: colors.textSecondary, marginBottom: 20, marginTop: 8 },

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

  nextButtonDisabled: { backgroundColor: "#E5E7EB", shadowOpacity: 0.05, elevation: 0 },
  nextText: { color: colors.white, fontSize: 17, fontWeight: "700" },
  nextTextDisabled: { color: "#9CA3AF" },
});
