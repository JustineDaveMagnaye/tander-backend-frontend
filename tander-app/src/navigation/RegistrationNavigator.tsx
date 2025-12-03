import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Formik } from "formik";
import React from "react";
import { Alert } from "react-native";

import RegistrationComplete from "../screens/Registration/RegistrationComplete";
import Step1BasicInfo from "../screens/Registration/Step1BasicInfo";
import Step2Upload from "../screens/Registration/Step2Upload";
import Step3AboutYou from "../screens/Registration/Step3AboutYou";

import RegistrationSchema from "../context/RegistrationSchema";
import { useAuth } from "../hooks/useAuth";
import NavigationService from "./NavigationService";

import { RegistrationStackParamList } from "./NavigationTypes";

const Stack = createNativeStackNavigator<RegistrationStackParamList>();

export default function RegistrationNavigator() {
  const { completeProfile, phase1Data } = useAuth();

  const handleRegistration = async (values: any) => {
    try {
      // Check if Phase 1 data exists
      if (!phase1Data) {
        Alert.alert(
          'Error',
          'Please complete account creation first.',
          [
            {
              text: 'Go Back',
              onPress: () => NavigationService.navigate('Auth', { screen: 'AccountIntroScreen' }),
            },
          ]
        );
        return;
      }

      // Use Phase 1 credentials from context
      const { username, email } = phase1Data;

      // Phase 2: Complete profile with all details
      await completeProfile(username, {
        firstName: values.firstName,
        lastName: values.lastName,
        middleName: values.middleName || '',
        nickName: values.nickName,
        address: values.address || '',
        phone: values.phone || '',
        email: email,
        birthDate: values.birthday,
        age: parseInt(values.age) || 0,
        country: values.country,
        city: values.city,
        civilStatus: values.civilStatus,
        hobby: values.hobby || '',
      });

      Alert.alert(
        'Success',
        'Registration completed! Please login with your credentials.',
        [
          {
            text: 'Login',
            onPress: () => NavigationService.navigate('Auth', { screen: 'LoginScreen' }),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Please try again.');
      console.error('Phase 2 registration error:', error);
    }
  };

  return (
    <Formik
      initialValues={{
        firstName: "",
        lastName: "",
        middleName: "",
        nickName: "",
        birthday: "",
        age: "",
        country: "",
        civilStatus: "",
        city: "",
        hobby: "",
        email: "", // TODO: Add email field to Step 1
        phone: "",
        address: "",
        photos: [],
        idPhotos: [],
        bio: "",
        interests: [],
        lookingFor: [],
      }}
      validationSchema={RegistrationSchema}
      onSubmit={handleRegistration}
    >
      {/* ❗ Now ALL screens inside can use useFormikContext() safely */}
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          animationDuration: 350,
          animationTypeForReplace: "push",
        }}
      >
        <Stack.Screen
          name="Step1"
          component={Step1BasicInfo}
          options={{
            animation: "fade",
            animationDuration: 400,
          }}
        />
        <Stack.Screen
          name="Step2"
          component={Step2Upload}
          options={{
            animation: "slide_from_right",
            animationDuration: 350,
          }}
        />
        <Stack.Screen
          name="Step3"
          component={Step3AboutYou}
          options={{
            animation: "slide_from_right",
            animationDuration: 350,
          }}
        />
        <Stack.Screen
          name="RegistrationComplete"
          component={RegistrationComplete}
          options={{
            animation: "fade_from_bottom",
            animationDuration: 400,
          }}
        />
      </Stack.Navigator>
    </Formik>
  );
}
