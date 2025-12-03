// // // import { Ionicons } from "@expo/vector-icons";
// // // import React, { useState } from "react";
// // // import {
// // //   StyleSheet,
// // //   Text,
// // //   TextInput,
// // //   TextInputProps,
// // //   TouchableOpacity,
// // //   View,
// // //   ViewStyle,
// // // } from "react-native";
// // // import colors from "../../config/colors";

// // // interface Props extends TextInputProps {
// // //   icon?: keyof typeof Ionicons.glyphMap;
// // //   error?: string | null;
// // //   containerStyle?: ViewStyle;
// // // }

// // // export default function AppTextInput({
// // //   icon,
// // //   error,
// // //   containerStyle,
// // //   secureTextEntry,
// // //   ...otherProps
// // // }: Props) {
// // //   const [hidePassword, setHidePassword] = useState(secureTextEntry);

// // //   return (
// // //     <View style={[styles.container, containerStyle]}>
// // //       {/* INPUT WRAPPER */}
// // //       <View
// // //         style={[
// // //           styles.inputWrapper,
// // //           error && { borderColor: colors.danger, borderWidth: 1 },
// // //         ]}
// // //       >
// // //         {icon && (
// // //           <Ionicons
// // //             name={icon}
// // //             size={22}
// // //             color={colors.textSecondary}
// // //             style={{ marginRight: 8 }}
// // //           />
// // //         )}

// // //         <TextInput
// // //           style={styles.input}
// // //           placeholderTextColor={colors.textMuted}
// // //           secureTextEntry={hidePassword}
// // //           {...otherProps}
// // //         />

// // //         {secureTextEntry && (
// // //           <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
// // //             <Ionicons
// // //               name={hidePassword ? "eye-off-outline" : "eye-outline"}
// // //               size={22}
// // //               color={colors.textSecondary}
// // //             />
// // //           </TouchableOpacity>
// // //         )}
// // //       </View>

// // //       {/* ⭐ RESERVED SPACE FOR ERROR (fixed height) */}
// // //       <View style={{ minHeight: 15, justifyContent: "center" }}>
// // //         {error && <Text style={styles.error}>{error}</Text>}
// // //       </View>
// // //     </View>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   container: {
// // //     width: "100%",
// // //     marginBottom: 14, // tighter spacing
// // //   },

// // //   inputWrapper: {
// // //     flexDirection: "row",
// // //     alignItems: "center",
// // //     width: "100%",
// // //     paddingHorizontal: 15,
// // //     paddingVertical: 14,
// // //     borderRadius: 40,
// // //     backgroundColor: colors.backgroundLight,
// // //     borderWidth: 0,
// // //   },

// // //   input: {
// // //     flex: 1,
// // //     fontSize: 16,
// // //     color: colors.textPrimary,
// // //   },

// // //   error: {
// // //     color: colors.danger,
// // //     fontSize: 13,
// // //     marginLeft: 10,
// // //     marginTop: 2,
// // //     height: 16,
// // //   },
// // // });

// // // src/components/common/AppTextInput.tsx

// // import { Ionicons } from "@expo/vector-icons";
// // import React, { useState } from "react";
// // import {
// //   StyleSheet,
// //   Text,
// //   TextInput,
// //   TextInputProps,
// //   TouchableOpacity,
// //   View,
// //   ViewStyle,
// // } from "react-native";
// // import colors from "../../config/colors";

// // interface Props extends TextInputProps {
// //   icon?: keyof typeof Ionicons.glyphMap;
// //   error?: string | null;
// //   containerStyle?: ViewStyle;
// // }

// // export default function AppTextInput({
// //   icon,
// //   error,
// //   containerStyle,
// //   secureTextEntry,
// //   ...otherProps
// // }: Props) {
// //   const [hidePassword, setHidePassword] = useState(secureTextEntry);

// //   return (
// //     <View style={[styles.container, containerStyle]}>
// //       {/* INPUT WRAPPER */}
// //       <View
// //         style={[
// //           styles.inputWrapper,
// //           error && { borderColor: colors.danger, borderWidth: 1 },
// //         ]}
// //       >
// //         {/* LEFT ICON */}
// //         {icon && (
// //           <Ionicons
// //             name={icon}
// //             size={22}
// //             color={colors.textSecondary}
// //             style={{ marginRight: 8 }}
// //           />
// //         )}

// //         {/* TEXT INPUT */}
// //         <TextInput
// //           style={styles.input}
// //           placeholderTextColor={colors.textMuted}
// //           secureTextEntry={hidePassword}
// //           {...otherProps}
// //         />

// //         {/* RIGHT TOGGLE FOR PASSWORD */}
// //         {secureTextEntry && (
// //           <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
// //             <Ionicons
// //               name={hidePassword ? "eye-off-outline" : "eye-outline"}
// //               size={22}
// //               color={colors.textSecondary}
// //             />
// //           </TouchableOpacity>
// //         )}
// //       </View>

// //       {/* ⭐ RESERVED ERROR SPACE — THIS KEEPS SIZE FIXED */}
// //       {error ? (
// //         <Text style={styles.error}>{error}</Text>
// //       ) : (
// //         <Text style={styles.errorPlaceholder}> </Text>
// //       )}
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     width: "100%",
// //     marginBottom: 14, // consistent spacing
// //   },

// //   inputWrapper: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     width: "100%",
// //     paddingHorizontal: 15,
// //     paddingVertical: 14,
// //     borderRadius: 40,
// //     backgroundColor: colors.backgroundLight,
// //     borderWidth: 0,
// //   },

// //   input: {
// //     flex: 1,
// //     fontSize: 16,
// //     color: colors.textPrimary,
// //   },

// //   error: {
// //     color: colors.danger,
// //     fontSize: 13,
// //     marginLeft: 10,
// //     height: 16, // exact fixed height
// //     marginTop: 4,
// //   },

// //   // ⭐ this keeps layout stable even when no error
// //   errorPlaceholder: {
// //     height: 16,
// //     marginLeft: 10,
// //     marginTop: 4,
// //     opacity: 0, // invisible but takes up space
// //   },
// // });

// // src/components/common/AppTextInput.tsx

// import { Ionicons } from "@expo/vector-icons";
// import React, { useState } from "react";
// import {
//   StyleSheet,
//   Text,
//   TextInput,
//   TextInputProps,
//   TouchableOpacity,
//   View,
//   ViewStyle,
// } from "react-native";
// import colors from "../../config/colors";

// interface Props extends TextInputProps {
//   icon?: keyof typeof Ionicons.glyphMap;
//   error?: string | null;
//   containerStyle?: ViewStyle;
// }

// export default function AppTextInput({
//   icon,
//   error,
//   containerStyle,
//   secureTextEntry,
//   ...otherProps
// }: Props) {
//   const [hidePassword, setHidePassword] = useState(secureTextEntry);

//   return (
//     <View style={[styles.container, containerStyle]}>
//       {/* INPUT WRAPPER */}
//       <View
//         style={[
//           styles.inputWrapper,
//           error && { borderColor: colors.danger, borderWidth: 1 },
//         ]}
//       >
//         {/* LEFT ICON */}
//         {icon && (
//           <Ionicons
//             name={icon}
//             size={22}
//             color={colors.textSecondary}
//             style={{ marginRight: 8 }}
//           />
//         )}

//         {/* TEXT INPUT */}
//         <TextInput
//           style={styles.input}
//           placeholderTextColor={colors.textMuted}
//           secureTextEntry={hidePassword}
//           {...otherProps}
//         />

//         {/* RIGHT TOGGLE FOR PASSWORD */}
//         {secureTextEntry && (
//           <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
//             <Ionicons
//               name={hidePassword ? "eye-off-outline" : "eye-outline"}
//               size={22}
//               color={colors.textSecondary}
//             />
//           </TouchableOpacity>
//         )}
//       </View>

//       {/* ⭐ RESERVED ERROR SPACE — THIS KEEPS SIZE FIXED */}
//       {error ? (
//         <Text style={styles.error}>{error}</Text>
//       ) : (
//         <Text style={styles.errorPlaceholder}> </Text>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     width: "100%",
//     marginBottom: 14, // consistent spacing
//   },

//   inputWrapper: {
//     flexDirection: "row",
//     alignItems: "center",
//     width: "100%",
//     paddingHorizontal: 15,
//     paddingVertical: 14,
//     borderRadius: 40,
//     backgroundColor: colors.backgroundLight,
//     borderWidth: 0,
//   },

//   input: {
//     flex: 1,
//     fontSize: 16,
//     color: colors.textPrimary,
//   },

//   error: {
//     color: colors.danger,
//     fontSize: 13,
//     marginLeft: 10,
//     height: 16, // exact fixed height
//     marginTop: 4,
//   },

//   // ⭐ this keeps layout stable even when no error
//   errorPlaceholder: {
//     height: 16,
//     marginLeft: 10,
//     marginTop: 4,
//     opacity: 0, // invisible but takes up space
//   },
// });
// src/components/common/AppTextInput.tsx

import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import colors from "../../config/colors";

interface Props extends TextInputProps {
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string | null;
  containerStyle?: ViewStyle;
}

export default function AppTextInput({
  icon,
  error,
  containerStyle,
  secureTextEntry,
  ...otherProps
}: Props) {
  const [hidePassword, setHidePassword] = useState(secureTextEntry);

  return (
    <View style={[styles.container, containerStyle]}>
      {/* INPUT WRAPPER */}
      <View
        style={[
          styles.inputWrapper,
          {
            borderWidth: 1, // always fixed to prevent layout jump
            borderColor: error ? colors.danger : "transparent",
          },
        ]}
      >
        {/* LEFT ICON */}
        {icon && (
          <Ionicons
            name={icon}
            size={22}
            color={colors.textSecondary}
            style={{ marginRight: 8 }}
          />
        )}

        {/* TEXT INPUT */}
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={hidePassword}
          {...otherProps}
        />

        {/* PASSWORD TOGGLE (RIGHT ICON) */}
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
            <Ionicons
              name={hidePassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* ⭐ FIXED HEIGHT ERROR MESSAGE (No Jumping) */}
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <Text style={styles.errorPlaceholder}> </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 14, // consistent spacing across all inputs
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderRadius: 40,
    backgroundColor: colors.backgroundLight,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },

  error: {
    color: colors.danger,
    fontSize: 13,
    marginLeft: 10,
    marginTop: 4,
    height: 16, // FIXED HEIGHT ensures no form movement
  },

  // Invisible placeholder to keep consistent height
  errorPlaceholder: {
    height: 16,
    marginLeft: 10,
    marginTop: 4,
    opacity: 0,
  },
});
