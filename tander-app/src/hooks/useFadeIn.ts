import { useEffect, useRef } from "react";
import { Animated } from "react-native";

/**
 * Custom hook for fade-in animation
 * @param duration - Animation duration in milliseconds
 * @param delay - Optional delay before animation starts
 * @returns Animated value for opacity
 */
export const useFadeIn = (duration: number = 600, delay: number = 0) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, []);

  return fadeAnim;
};

/**
 * Custom hook for slide-up animation
 * @param duration - Animation duration in milliseconds
 * @param delay - Optional delay before animation starts
 * @param distance - Distance to slide from (default 50)
 * @returns Animated values for opacity and translateY
 */
export const useSlideUp = (
  duration: number = 600,
  delay: number = 0,
  distance: number = 50
) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return { opacity: fadeAnim, translateY: slideAnim };
};

/**
 * Custom hook for stagger animation (multiple items appearing one by one)
 * @param itemCount - Number of items to animate
 * @param staggerDelay - Delay between each item (default 100ms)
 * @param duration - Animation duration for each item
 * @returns Array of animated values
 */
export const useStaggerAnimation = (
  itemCount: number,
  staggerDelay: number = 100,
  duration: number = 400
) => {
  const animations = useRef(
    Array.from({ length: itemCount }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const animationSequence = animations.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration,
        delay: index * staggerDelay,
        useNativeDriver: true,
      })
    );

    Animated.stagger(staggerDelay, animationSequence).start();
  }, []);

  return animations;
};

/**
 * Custom hook for scale animation on press
 * @returns Animated value and press handlers
 */
export const useScaleAnimation = () => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  return { scale: scaleAnim, onPressIn, onPressOut };
};
