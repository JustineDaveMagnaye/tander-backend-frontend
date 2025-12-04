import * as Yup from "yup";

// Helper to validate date format (MM/DD/YYYY)
const isValidDate = (dateString: string): boolean => {
  if (!dateString) return false;

  const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
  if (!dateRegex.test(dateString)) return false;

  const [month, day, year] = dateString.split("/").map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

// Helper to validate minimum age (18+)
const isMinimumAge = (dateString: string, minAge: number = 18): boolean => {
  if (!isValidDate(dateString)) return false;

  const [month, day, year] = dateString.split("/").map(Number);
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age >= minAge;
};

export default Yup.object().shape({
  // Step 1: Basic Info
  firstName: Yup.string()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters")
    .matches(/^[a-zA-Z\s-']+$/, "First name can only contain letters"),

  lastName: Yup.string()
    .required("Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters")
    .matches(/^[a-zA-Z\s-']+$/, "Last name can only contain letters"),

  nickName: Yup.string()
    .required("Nickname is required")
    .min(2, "Nickname must be at least 2 characters")
    .max(20, "Nickname must be less than 20 characters")
    .matches(/^[a-zA-Z0-9_]+$/, "Nickname can only contain letters, numbers, and underscores"),

  birthday: Yup.string()
    .required("Birthday is required")
    .test("valid-date", "Please enter a valid date (MM/DD/YYYY)", isValidDate)
    .test("minimum-age", "You must be at least 60 years old", (value) =>
      value ? isMinimumAge(value, 60) : false
    ),

  age: Yup.number()
    .required("Age is required")
    .min(60, "You must be at least 60 years old")
    .max(100, "Please enter a valid age"),

  country: Yup.string().required("Country is required"),

  civilStatus: Yup.string().required("Civil status is required"),

  city: Yup.string().required("City/Province is required"),

  hobby: Yup.string().required("Hobby is required"),

  // Step 2: Photos & ID
  photos: Yup.array().min(2, "At least 2 photos"),
  idFront: Yup.string().required("Front ID required"),

  // Step 3: Bio & Interests
  bio: Yup.string().min(10, "Please write a short bio"),
  interests: Yup.array().min(1, "Select at least 1 interest"),
});
