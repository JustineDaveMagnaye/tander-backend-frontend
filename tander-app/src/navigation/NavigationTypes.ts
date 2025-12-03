import { NativeStackNavigationProp } from "@react-navigation/native-stack";

/**
 * ROOT NAVIGATION
 * (Your main navigator: Onboarding → Auth → Home)
 */
export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  HomeScreen: undefined;
};

/**
 * REGISTRATION FLOW (3-step signup)
 */
export type RegistrationStackParamList = {
  Step1: undefined;
  Step2: undefined;
  Step3: undefined;
  RegistrationComplete: undefined;
};

/**
 * TYPED NAVIGATION FOR EACH REGISTRATION SCREEN
 */
export type Step1Nav = NativeStackNavigationProp<
  RegistrationStackParamList,
  "Step1"
>;

export type Step2Nav = NativeStackNavigationProp<
  RegistrationStackParamList,
  "Step2"
>;

export type Step3Nav = NativeStackNavigationProp<
  RegistrationStackParamList,
  "Step3"
>;

export type RegistrationCompleteNav = NativeStackNavigationProp<
  RegistrationStackParamList,
  "RegistrationComplete"
>;
