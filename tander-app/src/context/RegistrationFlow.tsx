import { Formik } from "formik";
import React, { ReactNode } from "react";
import RegistrationSchema from "./RegistrationSchema";

export const RegistrationFlow = ({ children }: { children: ReactNode }) => {
  const initialValues = {
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
    idFront: "",
    idBack: "",
    bio: "",
    interests: [],
    lookingFor: [],
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={RegistrationSchema}
      onSubmit={(values) => console.log("FINAL REGISTRATION:", values)}
    >
      {children}
    </Formik>
  );
};
