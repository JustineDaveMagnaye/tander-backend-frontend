// Extracts a clean string from Formik/Yup errors
export function getErrorString(error: any): string | undefined {
  if (typeof error === "string") return error;

  if (Array.isArray(error)) {
    return typeof error[0] === "string" ? error[0] : undefined;
  }

  return undefined;
}
