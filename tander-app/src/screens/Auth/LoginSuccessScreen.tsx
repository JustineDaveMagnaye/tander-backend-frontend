// import FullScreen from "@/src/components/layout/FullScreen";
// import colors from "@/src/config/colors";
// import NavigationService from "@/src/navigation/NavigationService";
// import React, { useEffect, useRef } from "react";
// import { Animated, Image, StyleSheet, View } from "react-native";

// export default function LoginSuccessScreen() {
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const scaleAnim = useRef(new Animated.Value(0.7)).current;

//   useEffect(() => {
//     // Animate check icon
//     Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 600,
//         useNativeDriver: true,
//       }),
//       Animated.spring(scaleAnim, {
//         toValue: 1,
//         friction: 5,
//         tension: 80,
//         useNativeDriver: true,
//       }),
//     ]).start();

//     // Auto redirect
//     const timer = setTimeout(() => {
//       NavigationService.replace("HomeScreen", {
//         screen: "HomeScreen",
//       });
//     }, 1500);

//     return () => clearTimeout(timer);
//   }, []);

//   return (
//     <FullScreen statusBarStyle="light">
//       <View style={styles.container}>
//         {/* Animated Circle with Checkmark */}
//         <Animated.View
//           style={[
//             styles.circleWrapper,
//             {
//               opacity: fadeAnim,
//               transform: [{ scale: scaleAnim }],
//             },
//           ]}
//         >
//           <Image
//             source={require("../../assets/icons/check.png")}
//             style={styles.checkIcon}
//           />
//         </Animated.View>

//         {/* Success Text */}
//         <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
//           Login Successful!
//         </Animated.Text>

//         <Animated.Text style={[styles.subtitle, { opacity: fadeAnim }]}>
//           You are now logged in.
//         </Animated.Text>
//       </View>
//     </FullScreen>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.accentTeal,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 32,
//   },

//   circleWrapper: {
//     width: 160,
//     height: 160,
//     borderRadius: 200,
//     backgroundColor: "white",
//     justifyContent: "center",
//     alignItems: "center",

//     // green glow effect
//     shadowColor: "#00ff99",
//     shadowOpacity: 0.4,
//     shadowRadius: 20,
//     shadowOffset: { width: 0, height: 0 },
//     elevation: 6,
//   },

//   checkIcon: {
//     width: 80,
//     height: 80,
//     tintColor: "#35C759",
//   },

//   title: {
//     color: "white",
//     fontSize: 24,
//     fontWeight: "700",
//     marginTop: 24,
//   },

//   subtitle: {
//     color: "white",
//     fontSize: 16,
//     marginTop: 6,
//   },
// });

import AppHeaderWithLogo from "@/src/components/common/AppHeaderWithLogo";
import FullScreen from "@/src/components/layout/FullScreen";
import NavigationService from "@/src/navigation/NavigationService";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginSuccessScreen() {
  const text1Fade = useRef(new Animated.Value(0)).current;
  const text2Fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Text animation
    Animated.timing(text1Fade, {
      toValue: 1,
      duration: 500,
      delay: 300,
      useNativeDriver: true,
    }).start();

    Animated.timing(text2Fade, {
      toValue: 1,
      duration: 500,
      delay: 500,
      useNativeDriver: true,
    }).start();

    // Auto navigation after animation completes
    const timer = setTimeout(() => {
      NavigationService.replace("HomeScreen");
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <FullScreen statusBarStyle="dark">
      <View style={styles.container}>
        <SafeAreaView edges={["top"]} style={styles.headerView}>
          <AppHeaderWithLogo />
        </SafeAreaView>
        {/* Lottie Animation */}
        <LottieView
          source={require("../../assets/animations/Success.json")}
          autoPlay
          loop={false}
          style={styles.lottie}
        />

        {/* Text */}
        <Animated.Text style={[styles.text1, { opacity: text1Fade }]}>
          Log in Success!
        </Animated.Text>

        <Animated.Text style={[styles.text2, { opacity: text2Fade }]}>
          Authenticated Successfully
        </Animated.Text>
      </View>
    </FullScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  headerView: {
    justifyContent: "center",
    alignItems: "center",
  },

  lottie: {
    width: 500,
    height: 500,
    alignSelf: "center",
  },

  text1: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: "700",
    color: "#2DC46A",
  },

  text2: {
    marginTop: 6,
    fontSize: 14,
    color: "#555",
  },
});
