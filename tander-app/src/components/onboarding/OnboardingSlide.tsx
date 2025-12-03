import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Animated,
  Image,
  ImageSourcePropType,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import colors from "../../config/colors";
import AppText from "../inputs/AppText";

type SlideItem = {
  id: string;
  title: string;
  description: string;
  image: ImageSourcePropType;
  accent: string;
};

type SlideProps = {
  item: SlideItem;
  index: number;
  scrollX: Animated.Value;
};

export default function OnboardingSlide({ item, index, scrollX }: SlideProps) {
  const { width } = useWindowDimensions();
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const imageScale = scrollX.interpolate({
    inputRange,
    outputRange: [0.9, 1, 0.9],
    extrapolate: "clamp",
  });

  const translateY = scrollX.interpolate({
    inputRange,
    outputRange: [10, 0, 10],
    extrapolate: "clamp",
  });

  return (
    <View style={[styles.slide, { width }]}> 
      <Animated.View
        style={{
          marginHorizontal: 24,
          borderRadius: 28,
          overflow: "hidden",
          transform: [{ scale: imageScale }],
        }}
      >
        <View style={styles.imageShadow}>
          <Image source={item.image} style={styles.image} resizeMode="cover" />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.4)"]}
            style={styles.overlay}
          />
        </View>
      </Animated.View>

      <Animated.View
        style={{
          paddingHorizontal: 26,
          transform: [{ translateY }],
        }}
      >
        <View style={[styles.badge, { backgroundColor: item.accent }]}> 
          <AppText size="caption" weight="semibold" color={colors.white}>
            Step {index + 1}
          </AppText>
        </View>

        <AppText weight="bold" style={styles.title}>
          {item.title}
        </AppText>
        <AppText style={styles.description} color={colors.textSecondary}>
          {item.description}
        </AppText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    justifyContent: "center",
  },
  imageShadow: {
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  image: {
    width: "100%",
    height: 320,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  description: {
    fontSize: 17,
    lineHeight: 24,
  },
});

export type { SlideItem };
