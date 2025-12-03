import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import colors from "../../config/colors";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ID card proportions (standard ID card is approximately 3.375" x 2.125" = 1.59:1 ratio)
const CARD_ASPECT_RATIO = 1.59;
const OVERLAY_WIDTH = SCREEN_WIDTH * 0.85; // 85% of screen width
const OVERLAY_HEIGHT = OVERLAY_WIDTH / CARD_ASPECT_RATIO;

interface Props {
  onCapture: (photoUri: string) => void;
  onCancel: () => void;
}

export default function IDCardCameraOverlay({ onCapture, onCancel }: Props) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraType] = useState<CameraType>("back");

  // Request permissions if not granted
  React.useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  // Handle photo capture
  const takePicture = async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: false,
        exif: false,
      });

      if (photo && photo.uri) {
        onCapture(photo.uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Camera Error", "Failed to capture photo. Please try again.");
    } finally {
      setIsCapturing(false);
    }
  };

  // Show loading while permissions are being requested
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  // Show permission denied message
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color={colors.textMuted} />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            Please allow camera access to scan your ID.
          </Text>
          <Pressable style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </Pressable>
          <Pressable style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={cameraType}
      >
        {/* Dark Overlay with Cutout */}
        <View style={styles.overlayContainer}>
          {/* Top Dark Area */}
          <View style={styles.overlayTop} />

          {/* Middle Row with Card Cutout */}
          <View style={styles.overlayMiddleRow}>
            <View style={styles.overlaySide} />

            {/* Card Outline Area */}
            <View style={styles.cardOutlineContainer}>
              {/* Corner Guides */}
              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />

              {/* Card Border */}
              <View style={styles.cardBorder} />
            </View>

            <View style={styles.overlaySide} />
          </View>

          {/* Bottom Dark Area */}
          <View style={styles.overlayBottom} />
        </View>

        {/* Instructions at Top */}
        <View style={styles.instructionsContainer}>
          <View style={styles.instructionsBadge}>
            <Ionicons name="card-outline" size={20} color={colors.white} />
            <Text style={styles.instructionsText}>
              Position ID within the frame
            </Text>
          </View>
          <Text style={styles.instructionsSubtext}>
            Ensure all edges are visible and text is readable
          </Text>
        </View>

        {/* Controls at Bottom */}
        <View style={styles.controlsContainer}>
          {/* Cancel Button */}
          <Pressable
            style={styles.controlButton}
            onPress={onCancel}
            disabled={isCapturing}
          >
            <Ionicons name="close" size={28} color={colors.white} />
          </Pressable>

          {/* Capture Button */}
          <Pressable
            style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
            onPress={takePicture}
            disabled={isCapturing}
          >
            <View style={styles.captureButtonInner} />
          </Pressable>

          {/* Info Button (placeholder for balance) */}
          <Pressable
            style={styles.controlButton}
            onPress={() => {
              Alert.alert(
                "ID Photo Tips",
                "• Ensure good lighting\n• Place ID flat against a dark surface\n• Make sure all text is readable\n• Keep the card within the guide frame\n• Hold your phone steady"
              );
            }}
          >
            <Ionicons name="information-circle-outline" size={28} color={colors.white} />
          </Pressable>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },

  camera: {
    flex: 1,
  },

  // Permission Styles
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },

  permissionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: 24,
    marginBottom: 12,
    textAlign: "center",
  },

  permissionText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },

  permissionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    marginBottom: 12,
  },

  permissionButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },

  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },

  cancelButtonText: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: "600",
  },

  // Overlay Styles
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
  },

  overlayTop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },

  overlayMiddleRow: {
    flexDirection: "row",
    height: OVERLAY_HEIGHT,
  },

  overlaySide: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },

  overlayBottom: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },

  // Card Outline Styles
  cardOutlineContainer: {
    width: OVERLAY_WIDTH,
    height: OVERLAY_HEIGHT,
    position: "relative",
  },

  cardBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
    borderColor: colors.primary,
    borderRadius: 12,
    borderStyle: "dashed",
  },

  // Corner Guide Styles
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: colors.white,
    borderWidth: 4,
  },

  cornerTopLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 12,
  },

  cornerTopRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 12,
  },

  cornerBottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
  },

  cornerBottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 12,
  },

  // Instructions Styles
  instructionsContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 20,
  },

  instructionsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    gap: 8,
    marginBottom: 8,
  },

  instructionsText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.white,
  },

  instructionsSubtext: {
    fontSize: 13,
    color: colors.white,
    textAlign: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
  },

  // Controls Styles
  controlsContainer: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 50 : 30,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 40,
  },

  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },

  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: colors.primary,
  },

  captureButtonDisabled: {
    opacity: 0.5,
  },

  captureButtonInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primary,
  },
});
