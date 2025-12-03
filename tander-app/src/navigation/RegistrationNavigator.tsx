import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Formik } from "formik";
import React from "react";

import RegistrationComplete from "../screens/Registration/RegistrationComplete";
import Step1BasicInfo from "../screens/Registration/Step1BasicInfo";
import Step2Upload from "../screens/Registration/Step2Upload";
import Step3AboutYou from "../screens/Registration/Step3AboutYou";

import RegistrationSchema from "../context/RegistrationSchema";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import NavigationService from "./NavigationService";

import { RegistrationStackParamList } from "./NavigationTypes";

const Stack = createNativeStackNavigator<RegistrationStackParamList>();

export default function RegistrationNavigator() {
  const { completeProfile, phase1Data } = useAuth();
  const toast = useToast();

  // Helper function to convert MM/DD/YYYY to ISO format (yyyy-MM-dd)
  const convertToISODate = (dateString: string): string => {
    if (!dateString) return '';
    const [month, day, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const handleRegistration = async (values: any) => {
    try {
      console.log('🟡 [RegistrationNavigator] Starting Phase 2 registration...');
      console.log('🟡 [RegistrationNavigator] Form values:', values);

      // Check if Phase 1 data exists
      if (!phase1Data) {
        console.error('🔴 [RegistrationNavigator] No phase1Data found!');
        toast.showToast({
          type: 'error',
          message: 'Please complete account creation first.',
          duration: 5000,
          action: {
            label: 'Go Back',
            onPress: () => NavigationService.navigate('Auth', { screen: 'AccountIntroScreen' }),
          },
        });
        return;
      }

      // Use Phase 1 credentials from context
      const { username, email } = phase1Data;
      console.log('🟡 [RegistrationNavigator] Phase1Data:', { username, email });

      // Convert date format for backend
      const isoDate = convertToISODate(values.birthday);
      console.log('🟡 [RegistrationNavigator] Date conversion:', { original: values.birthday, iso: isoDate });

      // Phase 2: Complete profile with all details
      const profileData = {
        firstName: values.firstName,
        lastName: values.lastName,
        middleName: values.middleName || '',
        nickName: values.nickName,
        address: values.address || '',
        phone: values.phone || '',
        email: email,
        birthDate: isoDate,
        age: parseInt(values.age) || 0,
        country: values.country,
        city: values.city,
        civilStatus: values.civilStatus,
        hobby: values.hobby || '',
      };

      console.log('🟡 [RegistrationNavigator] Calling completeProfile with:', profileData);
      await completeProfile(username, profileData);

      console.log('✅ [RegistrationNavigator] Profile completed successfully!');

      toast.showToast({
        type: 'success',
        message: 'Registration completed! Please login with your credentials.',
        duration: 5000,
        action: {
          label: 'Login',
          onPress: () => NavigationService.navigate('Auth', { screen: 'LoginScreen' }),
        },
      });

      // Auto-navigate after 2 seconds
      setTimeout(() => {
        NavigationService.navigate('Auth', { screen: 'LoginScreen' });
      }, 2000);
    } catch (error: any) {
      console.error('🔴 [RegistrationNavigator] Phase 2 registration error:', error);
      console.error('🔴 [RegistrationNavigator] Error message:', error.message);
      toast.error(error.message || 'Registration failed. Please try again.');
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
        email: phase1Data?.email || "", // Pre-filled from Phase 1 registration
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
