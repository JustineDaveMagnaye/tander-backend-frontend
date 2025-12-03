// import * as Google from "expo-auth-session/providers/google";
// import * as WebBrowser from "expo-web-browser";
// import { Platform } from "react-native";

// WebBrowser.maybeCompleteAuthSession();

// export function useGoogleLogin() {
//   const clientId =
//     Platform.OS === "ios"
//       ? "YOUR_IOS_CLIENT_ID"
//       : Platform.OS === "android"
//       ? "YOUR_ANDROID_CLIENT_ID"
//       : "YOUR_WEB_CLIENT_ID";

//   const [request, response, promptAsync] = Google.useAuthRequest({
//     clientId,
//     scopes: ["profile", "email"],
//   });

//   const login = async () => {
//     const result = await promptAsync();
//     if (result?.type !== "success") return null;

//     const token = result.authentication?.accessToken;

//     const userInfo = await fetch("https://www.googleapis.com/userinfo/v2/me", {
//       headers: { Authorization: `Bearer ${token}` },
//     }).then((res) => res.json());

//     return {
//       provider: "google",
//       google_user_id: userInfo.id,
//       email: userInfo.email,
//       name: userInfo.name,
//       avatar: userInfo.picture,
//     };
//   };

//   return { login };
// }

import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

export function useGoogleLogin() {
  const WEB_CLIENT_ID = "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com"; // ← MUST be the Web Client ID

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: WEB_CLIENT_ID,
    scopes: ["profile", "email"],
  });

  const login = async () => {
    const result = await promptAsync();
    if (result?.type !== "success") return null;

    const token = result.authentication?.accessToken;

    const userInfo = await fetch("https://www.googleapis.com/userinfo/v2/me", {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => res.json());

    return {
      provider: "google",
      google_user_id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      avatar: userInfo.picture,
    };
  };

  return { login };
}
