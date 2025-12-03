import React from "react";
import {
  Image,
  ImageBackground,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import Screen from "../../components/layout/Screen";

import GradientButton from "@/src/components/buttons/GradientButton";
import NavigationService from "@/src/navigation/NavigationService";
import OutlineButton from "../../components/buttons/OutlineButton";
import AppText from "../../components/inputs/AppText";

export default function WelcomeScreen() {
  return (
    <Screen style={{ paddingTop: 0, backgroundColor: "transparent" }}>
      <ImageBackground
        source={require("../../assets/images/SplashScreen.png")}
        style={styles.bg}
        resizeMode="cover"
        imageStyle={styles.bgImage} // ⭐ ensures bottom fill
      >
        {/* TOP SECTION */}
        <View style={styles.topContainer}>
          {/* Logo + Brand */}
          <View style={styles.logoRow}>
            <Image
              source={require("../../assets/icons/tander-logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            <AppText weight="bold" style={styles.logoTitle}>
              Tander
            </AppText>
          </View>

          {/* MAIN HEADING */}
          <AppText weight="semibold" style={styles.heading}>
            Welcome to{"\n"}Tander
          </AppText>

          {/* SUBTITLE */}
          <AppText weight="normal" style={styles.subtitle}>
            A place for senior citizens to socialize, connect, date, and find
            friendship and companionship.
          </AppText>
        </View>

        {/* BUTTON SECTION */}
        <View style={styles.bottomContainer}>
          <View style={styles.buttonContainer}>
            {/* <GradientButton
              title="Sign Up"
              onPress={() => console.log("Sign Up")}
              style={styles.signUpButton}
            /> */}
            <GradientButton
              title="Sign Up"
              onPress={() =>
                NavigationService.navigate("Onboarding", {
                  screen: "AccountIntroScreen",
                })
              }
              style={styles.signUpButton}
            />

            <OutlineButton
              title="Log In"
              onPress={() =>
                NavigationService.replace("Auth", {
                  screen: "LoginScreen",
                })
              }
            />
          </View>
        </View>
      </ImageBackground>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "space-between",
  },

  bgImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  /* ---------- TOP SECTION ---------- */
  topContainer: {
    paddingTop: Platform.OS === "ios" ? 10 : 10,
    paddingHorizontal: 26,
  },

  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 10,
  },

  logo: {
    width: 52,
    height: 52,
  },

  logoTitle: {
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: 0.2,
    color: "#000",
    marginTop: 2,
  },

  heading: {
    fontSize: 48,
    lineHeight: 60,
    letterSpacing: 0.396,
    color: "#000",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 24,
    lineHeight: 36,
    letterSpacing: 0.396,
    color: "#000",
    textAlign: "center",
    marginTop: 12,
    marginHorizontal: 8,
  },

  /* ---------- BOTTOM SECTION ---------- */
  bottomContainer: {
    paddingHorizontal: 28,
    paddingBottom: Platform.OS === "ios" ? 40 : 40,
  },

  buttonContainer: {
    width: "100%",
  },

  signUpButton: {
    marginBottom: 15,
  },
});
