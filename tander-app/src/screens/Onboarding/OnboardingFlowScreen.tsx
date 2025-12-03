import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

import GradientButton from "@/src/components/buttons/GradientButton";
import OutlineButton from "@/src/components/buttons/OutlineButton";
import AppText from "@/src/components/inputs/AppText";
import FullScreen from "@/src/components/layout/FullScreen";
import OnboardingDots from "@/src/components/onboarding/OnboardingDots";
import OnboardingSlide, {
  SlideItem,
} from "@/src/components/onboarding/OnboardingSlide";
import colors from "@/src/config/colors";
import NavigationService from "@/src/navigation/NavigationService";
import { SafeAreaView } from "react-native-safe-area-context";

const SLIDES: SlideItem[] = [
  {
    id: "1",
    title: "Meet new people nearby",
    description:
      "Connect with others in your area and start meaningful conversations.",
    image: require("../../assets/images/onboard-1st.png"),
    accent: colors.accentTeal,
  },
  {
    id: "2",
    title: "Find meaningful connections",
    description:
      "Discover people who share your interests and values to build lasting bonds.",
    image: require("../../assets/images/onboard2.png"),
    accent: colors.accentBlue,
  },
  {
    id: "3",
    title: "Start conversations that matter",
    description:
      "Share stories, hobbies, and plans together in a safe and welcoming space.",
    image: require("../../assets/images/onboard3.png"),
    accent: colors.primary,
  },
];

export default function OnboardingFlowScreen() {
  const { width } = useWindowDimensions();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<SlideItem>>(null);

  const viewabilityConfig = useMemo(
    () => ({ viewAreaCoveragePercentThreshold: 55 }),
    []
  );

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const getItemLayout = (_: unknown, index: number) => ({
    length: width,
    offset: width * index,
    index,
  });

  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < SLIDES.length) {
      flatListRef.current?.scrollToIndex({ index: nextIndex });
    } else {
      NavigationService.replace("WelcomeScreen");
    }
  };

  return (
    <FullScreen statusBarStyle="dark">
      <LinearGradient
        colors={[colors.gradients.registration.start, colors.white]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerRow}>
          <AppText size="small" weight="semibold" color={colors.textMuted}>
            {`0${currentIndex + 1}/0${SLIDES.length}`}
          </AppText>
          <OutlineButton
            title="Skip"
            onPress={() => NavigationService.replace("WelcomeScreen")}
            style={styles.skipButton}
          />
        </View>

        <Animated.FlatList
          data={SLIDES}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          renderItem={({ item, index }) => (
            <OnboardingSlide item={item} index={index} scrollX={scrollX} />
          )}
          ref={flatListRef}
          getItemLayout={getItemLayout}
          scrollEventThrottle={16}
        />

        <View style={styles.footer}>
          <OnboardingDots data={SLIDES} scrollX={scrollX} pageWidth={width} />

          <View style={styles.actionsRow}>
            {currentIndex > 0 ? (
              <OutlineButton
                title="Back"
                onPress={() =>
                  flatListRef.current?.scrollToIndex({
                    index: currentIndex - 1,
                  })
                }
                style={styles.secondaryButton}
              />
            ) : (
              <View style={{ flex: 1 }} />
            )}

            <GradientButton
              title={
                currentIndex === SLIDES.length - 1 ? "Get Started" : "Next"
              }
              onPress={handleNext}
              style={styles.primaryButton}
            />
          </View>
        </View>
      </SafeAreaView>
    </FullScreen>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingVertical: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  skipButton: {
    width: 96,
    borderColor: colors.borderMedium,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    gap: 14,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    borderColor: colors.borderMedium,
  },
  primaryButton: {
    flex: 2,
  },
});
