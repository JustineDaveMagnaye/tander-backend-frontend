import * as Yup from "yup";

export const loginSchema = Yup.object({
  username: Yup.string().required("Email or username is required"),
  password: Yup.string().required("Password is required"),
});
