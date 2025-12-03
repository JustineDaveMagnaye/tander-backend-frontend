import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import colors from "../../config/colors";

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

  // Request permissions and pick image
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
            "Sorry, we need camera roll permissions to upload photos."
          );
          setLoadingIndex(null);
          return;
        }
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
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
          onPress={() => pickImage(i)}
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
                name={isFirstSlot ? "cloud-upload-outline" : "add"}
                size={isFirstSlot ? 32 : 28}
                color={isFirstSlot ? colors.primary : colors.textMuted}
              />
              {isFirstSlot && (
                <Text style={styles.firstSlotText}>Add Photo</Text>
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
      {uploadedCount > 0 && (
        <Text style={styles.removeHintText}>
          💡 Tip: Long press on a photo to remove it
        </Text>
      )}
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
});
