import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import LoginScreen from "../screens/Auth/LoginScreen";
import LoginSuccessScreen from "../screens/Auth/LoginSuccessScreen";
import RegistrationNavigator from "./RegistrationNavigator";

export type AuthStackParamList = {
  LoginScreen: undefined;
  LoginSuccessScreen: { method: string };
  Register: undefined; // ← REQUIRED!
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="LoginSuccessScreen" component={LoginSuccessScreen} />
      <Stack.Screen name="Register" component={RegistrationNavigator} />
    </Stack.Navigator>
  );
}
