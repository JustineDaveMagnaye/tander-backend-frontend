import { Platform } from "react-native";
import colors from "./colors";

export default {
  colors,
  text: {
    color: colors.primaryDark,
    fontSize: 18,
    fontFamily: Platform.OS === "android" ? "Roboto" : "System", // uses Apple San Francisco
  },
};
