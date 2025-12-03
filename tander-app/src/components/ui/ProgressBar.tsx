import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import colors from "../../config/colors";

interface ProgressBarProps {
  step: number;
  total: number;
}

export default function ProgressBar({ step, total }: ProgressBarProps) {
  const progress = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(progress, {
        toValue: step / total,
        useNativeDriver: false,
        bounciness: 8,
        speed: 12,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        bounciness: 8,
        speed: 12,
      }),
    ]).start();
  }, [step]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Animated.View
      style={[styles.track, { transform: [{ scaleX: scaleAnim }] }]}
    >
      <Animated.View style={{ width: progressWidth }}>
        <LinearGradient
          colors={[
            colors.gradients.brandStrong.array[0],
            colors.gradients.brandStrong.array[1],
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.bar}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 20,
    width: "100%",
    marginBottom: 20,
    overflow: "hidden",
  },
  bar: {
    height: 6,
    borderRadius: 20,
  },
});
