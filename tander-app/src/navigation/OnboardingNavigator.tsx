import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import AccountIntroScreen from "../screens/Auth/AccountIntroScreen";
import SplashScreen from "../screens/Auth/SplashScreen";
import WelcomeScreen from "../screens/Auth/WelcomeScreen";
import OnboardingFlowScreen from "../screens/Onboarding/OnboardingFlowScreen";

const Stack = createNativeStackNavigator();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SplashScreen" component={SplashScreen} />
      <Stack.Screen name="OnboardingFlow" component={OnboardingFlowScreen} />
      <Stack.Screen name="AccountIntroScreen" component={AccountIntroScreen} />
      <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
    </Stack.Navigator>
  );
}
