// import AppNavigator from "./src/navigation/AppNavigator";

// export default function App() {
//   return <AppNavigator />;
// }
import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import { navigationRef } from "./src/navigation/NavigationService";
import RootNavigator from "./src/navigation/RootNavigator";
import { AuthProvider } from "./src/auth/AuthProvider";
import { ToastProvider } from "./src/context/ToastProvider";

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <NavigationContainer ref={navigationRef}>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </ToastProvider>
  );
}
