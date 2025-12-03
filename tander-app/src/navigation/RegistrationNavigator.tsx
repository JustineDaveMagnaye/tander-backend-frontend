import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Formik } from "formik";
import React from "react";

import RegistrationComplete from "../screens/Registration/RegistrationComplete";
import Step1BasicInfo from "../screens/Registration/Step1BasicInfo";
import Step2Upload from "../screens/Registration/Step2Upload";
import Step3AboutYou from "../screens/Registration/Step3AboutYou";

import RegistrationSchema from "../context/RegistrationSchema";

import { RegistrationStackParamList } from "./NavigationTypes";

const Stack = createNativeStackNavigator<RegistrationStackParamList>();

export default function RegistrationNavigator() {
  return (
    <Formik
      initialValues={{
        firstName: "",
        lastName: "",
        nickName: "",
        birthday: "",
        age: "",
        country: "",
        civilStatus: "",
        city: "",
        hobby: "",
        photos: [],
        idPhotos: [],
        bio: "",
        interests: [],
        lookingFor: [],
      }}
      validationSchema={RegistrationSchema}
      onSubmit={(values) => {
        console.log("FINAL VALUES:", values);
      }}
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
