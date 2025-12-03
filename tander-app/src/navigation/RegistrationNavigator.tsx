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
  const { register, completeProfile } = useAuth();

  const handleRegistration = async (values: any) => {
    try {
      // TODO: Add a Step 0 to collect username, email, and password
      // For now, we'll use placeholder values for testing

      // Derive username from email (you should collect this in a separate step)
      const username = values.email?.split('@')[0] || `${values.firstName.toLowerCase()}${values.lastName.toLowerCase()}`;
      const email = values.email || '';
      const password = 'TempPassword123!'; // TODO: This should come from a password field in Step 0

      // Phase 1: Create basic account
      await register({
        username,
        email,
        password,
      });

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

      Alert.alert('Success', 'Registration completed! Please login with your credentials.');
      NavigationService.navigate('Auth', { screen: 'LoginScreen' });
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Please try again.');
      console.error('Registration error:', error);
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
