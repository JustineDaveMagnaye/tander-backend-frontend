// import React, { useState } from "react";
// import { StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";
// import colors from "../../config/colors";

// interface OutlineButtonProps {
//   title: string;
//   onPress?: () => void;
//   style?: ViewStyle;
// }

// export default function OutlineButton({
//   title,
//   onPress,
//   style,
// }: OutlineButtonProps) {
//   const [pressed, setPressed] = useState(false);

//   return (
//     <TouchableOpacity
//       style={[
//         styles.button,
//         {
//           borderColor: pressed ? colors.pressed.primary : colors.primary,
//         },
//         style,
//       ]}
//       onPressIn={() => setPressed(true)}
//       onPressOut={() => setPressed(false)}
//       onPress={onPress}
//       activeOpacity={0.7}
//     >
//       <Text
//         style={[
//           styles.text,
//           { color: pressed ? colors.pressed.primary : colors.primary },
//         ]}
//       >
//         {title}
//       </Text>
//     </TouchableOpacity>
//   );
// }

// const styles = StyleSheet.create({
//   button: {
//     width: "100%",
//     paddingVertical: 14,
//     borderWidth: 2,
//     borderRadius: 30,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   text: {
//     fontSize: 18,
//     fontWeight: "600",
//   },
// });

import React, { useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

interface Props {
  title: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export default function OutlineButton({ title, onPress, style }: Props) {
  const [pressed, setPressed] = useState(false);
  const scaleAnim = new Animated.Value(1);

  const animateIn = () => {
    setPressed(true);
    Animated.timing(scaleAnim, {
      toValue: 0.97,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const animateOut = () => {
    setPressed(false);
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 120,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.button,
          {
            borderColor: pressed ? "rgba(255,255,255,0.7)" : "#FFFFFF",
            backgroundColor: pressed ? "rgba(255,255,255,0.1)" : "transparent",
          },
          style,
        ]}
        onPressIn={animateIn}
        onPressOut={animateOut}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.text,
            {
              color: pressed ? "rgba(255,255,255,0.8)" : "#FFFFFF",
            },
          ]}
        >
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    paddingVertical: 14,
    borderWidth: 2,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
