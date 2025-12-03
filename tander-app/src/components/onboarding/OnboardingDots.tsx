import React from "react";
import { Animated, StyleSheet, View } from "react-native";
import colors from "../../config/colors";

type DotProps<T> = {
  data: T[];
  scrollX: Animated.Value;
  size?: number;
  pageWidth: number;
};

export default function OnboardingDots<T>({
  data,
  scrollX,
  size = 10,
  pageWidth,
}: DotProps<T>) {
  return (
    <View style={styles.dotsContainer}>
      {data.map((_, index) => {
        const inputRange = [
          (index - 1) * pageWidth,
          index * pageWidth,
          (index + 1) * pageWidth,
        ];

        const animatedWidth = scrollX.interpolate({
          inputRange,
          outputRange: [size, size * 2.4, size],
          extrapolate: "clamp",
        });

        const animatedOpacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.4, 1, 0.4],
          extrapolate: "clamp",
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                width: animatedWidth,
                height: size,
                opacity: animatedOpacity,
                backgroundColor: colors.primary,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 8,
  },
  dot: {
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
});
