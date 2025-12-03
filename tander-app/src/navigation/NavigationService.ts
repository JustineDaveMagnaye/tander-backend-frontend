import { CommonActions, StackActions } from "@react-navigation/native";
import * as React from "react";

export const navigationRef = React.createRef<any>();

/** Navigate to a screen */
function navigate(name: string, params?: object) {
  navigationRef.current?.navigate(name, params);
}

/** Replace the current screen */
function replace(name: string, params?: object) {
  navigationRef.current?.dispatch(StackActions.replace(name, params));
}

/** Reset entire navigation stack (good for logout/onboard complete) */
function reset(name: string, params?: object) {
  navigationRef.current?.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name, params }],
    })
  );
}

/** Go back */
function goBack() {
  navigationRef.current?.goBack();
}

export default {
  navigate,
  replace,
  reset,
  goBack,
};
