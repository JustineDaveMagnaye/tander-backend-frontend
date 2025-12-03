import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import {
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import colors from "../../config/colors";
import IDCardCameraOverlay from "../camera/IDCardCameraOverlay";

interface PhotoUploadSectionProps {
  title: string;
  helperText: string;
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos: number;
  columns?: number;
}

export default function PhotoUploadSection({
  title,
  helperText,
  photos,
  onPhotosChange,
  maxPhotos,
  columns = 3,
}: PhotoUploadSectionProps) {
  const [loadingIndex, setLoadingIndex] = React.useState<number | null>(null);
  const [showCameraOverlay, setShowCameraOverlay] = React.useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = React.useState<number>(0);

  // Take photo with camera (SENIOR-FRIENDLY with ID Card Overlay)
  const takePhoto = async (index: number) => {
    try {
      setCurrentPhotoIndex(index);
      setShowCameraOverlay(true);
    } catch (error) {
      console.error("Error opening camera:", error);
      Alert.alert("Camera Error", "Failed to open camera. Please try again.");
    }
  };

  // Handle photo captured from camera overlay
  const handlePhotoCaptured = (photoUri: string) => {
    setShowCameraOverlay(false);
    const newPhotos = [...photos];
    newPhotos[currentPhotoIndex] = photoUri;
    onPhotosChange(newPhotos);
  };

  // Handle camera overlay cancel
  const handleCameraCancel = () => {
    setShowCameraOverlay(false);
  };

  // Choose from gallery (backup option)
  const pickImage = async (index: number) => {
    try {
      setLoadingIndex(index);

      // Request permissions
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Denied",
            "Sorry, we need photo library permissions to upload photos."
          );
          setLoadingIndex(null);
          return;
        }
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1, // High quality for OCR
      });

      if (!result.canceled && result.assets[0]) {
        const newPhotos = [...photos];
        newPhotos[index] = result.assets[0].uri;
        onPhotosChange(newPhotos);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    } finally {
      setLoadingIndex(null);
    }
  };

  // Show options for camera or gallery (SENIOR-FRIENDLY)
  const showPhotoOptions = (index: number) => {
    Alert.alert(
      "Add ID Photo",
      "Choose how you want to add your ID photo:",
      [
        {
          text: "📸 Use Camera (Recommended)",
          onPress: () => takePhoto(index),
        },
        {
          text: "🖼️ Choose from Photos",
          onPress: () => pickImage(index),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  // Remove image
  const removeImage = (index: number) => {
    Alert.alert("Remove Photo", "Do you want to remove this photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          const newPhotos = [...photos];
          newPhotos[index] = "";
          onPhotosChange(newPhotos);
        },
      },
    ]);
  };

  // Render upload slots
  const renderSlots = () => {
    const slots = [];
    for (let i = 0; i < maxPhotos; i++) {
      const hasPhoto = photos[i];
      const isLoading = loadingIndex === i;
      const isFirstSlot = i === 0;

      slots.push(
        <Pressable
          key={i}
          style={[
            styles.uploadBox,
            isFirstSlot && styles.firstUploadBox,
            hasPhoto && styles.uploadBoxWithPhoto,
          ]}
          onPress={() => showPhotoOptions(i)}
          onLongPress={() => hasPhoto && removeImage(i)}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : hasPhoto ? (
            <>
              <Image source={{ uri: hasPhoto }} style={styles.uploadedImage} />
              {/* Remove indicator on long press */}
              <View style={styles.removeHint}>
                <Ionicons name="close-circle" size={24} color={colors.white} />
              </View>
            </>
          ) : (
            <View style={styles.emptySlotContent}>
              <Ionicons
                name={isFirstSlot ? "camera" : "add"}
                size={isFirstSlot ? 36 : 28}
                color={isFirstSlot ? colors.primary : colors.textMuted}
              />
              {isFirstSlot && (
                <Text style={styles.firstSlotText}>Scan ID</Text>
              )}
            </View>
          )}
        </Pressable>
      );
    }
    return slots;
  };

  // Calculate upload count
  const uploadedCount = photos.filter((photo) => photo !== "").length;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.cardTitle}>{title}</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {uploadedCount}/{maxPhotos}
          </Text>
        </View>
      </View>

      <View style={[styles.grid, { gap: 12 }]}>{renderSlots()}</View>

      <Text style={styles.helperText}>{helperText}</Text>

      {/* Senior-Friendly Tips */}
      {uploadedCount === 0 && (
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>📸 Tips for Clear Photos:</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>✓ Use good lighting (natural light is best)</Text>
            <Text style={styles.tipItem}>✓ Place ID flat on a dark surface</Text>
            <Text style={styles.tipItem}>✓ Make sure birthdate is clearly visible</Text>
            <Text style={styles.tipItem}>✓ Hold phone steady or use a table</Text>
          </View>
        </View>
      )}

      {uploadedCount > 0 && (
        <Text style={styles.removeHintText}>
          💡 Tip: Long press on a photo to remove it
        </Text>
      )}

      {/* ID Card Camera Overlay Modal */}
      <Modal
        visible={showCameraOverlay}
        animationType="slide"
        onRequestClose={handleCameraCancel}
      >
        <IDCardCameraOverlay
          onCapture={handlePhotoCaptured}
          onCancel={handleCameraCancel}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,

    // Shadow
    shadowColor: colors.shadowMedium,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  countBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },

  countText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.white,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 12,
    marginBottom: 12,
  },

  uploadBox: {
    width: 95,
    height: 95,
    backgroundColor: "#F8F8F8",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#ECECEC",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  firstUploadBox: {
    borderColor: colors.primary,
    borderWidth: 2,
    borderStyle: "dashed",
    backgroundColor: "#FFF9F5",
  },

  uploadBoxWithPhoto: {
    borderWidth: 0,
    position: "relative",
  },

  emptySlotContent: {
    alignItems: "center",
    gap: 4,
  },

  firstSlotText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.primary,
    marginTop: 2,
  },

  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },

  uploadedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  removeHint: {
    position: "absolute",
    top: 4,
    right: 4,
    opacity: 0.9,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 12,
  },

  helperText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },

  removeHintText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 8,
    fontStyle: "italic",
  },

  // Senior-Friendly Tips Styles
  tipsContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#FFF9F0",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFE4C4",
  },

  tipsTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 12,
  },

  tipsList: {
    gap: 8,
  },

  tipItem: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    paddingLeft: 8,
  },
});
