import { Platform } from "react-native";
import colors from "./colors";
import typography from "./typography";

export default {
  colors,

  text: {
    fontSize: typography.sizes.body,
    color: colors.textPrimary || colors.primaryDark,
    fontFamily: Platform.OS === "android" ? "Roboto" : "System", // SF Pro on iOS
  },
};
